import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@libsql/client';
import { PDFParse } from 'pdf-parse';

function getDb() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:/home/z/my-project/db/custom.db',
    authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
  });
}

// Verificar sesión
async function verifySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  
  if (!token) return null;

  const db = getDb();
  const result = await db.execute({
    sql: `SELECT s.negocioId FROM Sesion s WHERE s.token = ? AND s.expiresAt > ?`,
    args: [token, new Date().toISOString()]
  });

  return result.rows.length > 0 ? result.rows[0].negocioId as string : null;
}

// Extraer texto de PDF usando pdf-parse (JavaScript puro - funciona en Vercel)
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await PDFParse(buffer);
    return data.text || '';
  } catch (error) {
    console.error('Error extracting PDF:', error);
    throw new Error('No se pudo procesar el PDF');
  }
}

// Extraer texto de una URL
async function extractTextFromURL(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/pdf')) {
      const buffer = Buffer.from(await response.arrayBuffer());
      return extractTextFromPDF(buffer);
    } else {
      // Intentar obtener texto de una página web
      const html = await response.text();
      // Extraer texto básico del HTML
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return text;
    }
  } catch (error) {
    console.error('Error fetching URL:', error);
    throw new Error('No se pudo obtener el contenido de la URL');
  }
}

// GET - Obtener conocimiento actual
export async function GET() {
  try {
    const negocioId = await verifySession();
    if (!negocioId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const db = getDb();
    const result = await db.execute({
      sql: `SELECT conocimientoBase, conocimientoArchivos FROM Negocio WHERE id = ?`,
      args: [negocioId]
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    const row = result.rows[0];
    let archivos = [];
    try {
      archivos = row.conocimientoArchivos ? JSON.parse(row.conocimientoArchivos as string) : [];
    } catch {
      archivos = [];
    }

    return NextResponse.json({
      conocimiento: row.conocimientoBase || '',
      archivos
    });
  } catch (error) {
    console.error('Error en GET conocimiento:', error);
    return NextResponse.json({ error: 'Error al obtener conocimiento' }, { status: 500 });
  }
}

// POST - Subir PDF, texto o URL
export async function POST(request: NextRequest) {
  try {
    const negocioId = await verifySession();
    if (!negocioId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    
    const db = getDb();

    // Obtener conocimiento actual
    const currentResult = await db.execute({
      sql: `SELECT conocimientoBase, conocimientoArchivos FROM Negocio WHERE id = ?`,
      args: [negocioId]
    });

    const current = currentResult.rows[0];
    let conocimientoActual = (current?.conocimientoBase as string) || '';
    let archivosActuales: Array<{nombre: string, fecha: string, caracteres: number, tipo?: string}> = [];
    try {
      archivosActuales = current?.conocimientoArchivos ? JSON.parse(current.conocimientoArchivos as string) : [];
    } catch {
      archivosActuales = [];
    }

    // Si es multipart/form-data (archivo)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      
      if (file && file.type === 'application/pdf') {
        // Procesar PDF
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const textoExtraido = await extractTextFromPDF(buffer);
        
        if (!textoExtraido || textoExtraido.length < 50) {
          return NextResponse.json({ 
            error: 'No se pudo extraer texto del PDF. Asegúrate de que no sea un PDF escaneado (imagen).' 
          }, { status: 400 });
        }

        // Agregar al conocimiento existente
        const nuevoContenido = `\n\n=== DOCUMENTO: ${file.name} ===\n${textoExtraido}`;
        conocimientoActual += nuevoContenido;

        // Agregar a la lista de archivos
        archivosActuales.push({
          nombre: file.name,
          fecha: new Date().toISOString(),
          caracteres: textoExtraido.length,
          tipo: 'pdf'
        });

        // Guardar en BD
        await db.execute({
          sql: `UPDATE Negocio SET conocimientoBase = ?, conocimientoArchivos = ? WHERE id = ?`,
          args: [conocimientoActual, JSON.stringify(archivosActuales), negocioId]
        });

        return NextResponse.json({
          success: true,
          message: `PDF procesado: ${textoExtraido.length} caracteres extraídos`,
          archivos: archivosActuales
        });
      }
      
      return NextResponse.json({ 
        error: 'Se requiere un archivo PDF válido' 
      }, { status: 400 });
    }
    
    // Si es application/json (texto o URL)
    const body = await request.json();
    const { texto, url } = body;

    if (url) {
      // Procesar URL
      const textoExtraido = await extractTextFromURL(url);
      
      if (!textoExtraido || textoExtraido.length < 50) {
        return NextResponse.json({ 
          error: 'No se pudo extraer contenido de la URL' 
        }, { status: 400 });
      }

      const nuevoContenido = `\n\n=== CONTENIDO DE URL: ${url} ===\n${textoExtraido}`;
      conocimientoActual += nuevoContenido;

      archivosActuales.push({
        nombre: url.substring(0, 50),
        fecha: new Date().toISOString(),
        caracteres: textoExtraido.length,
        tipo: 'url'
      });

      await db.execute({
        sql: `UPDATE Negocio SET conocimientoBase = ?, conocimientoArchivos = ? WHERE id = ?`,
        args: [conocimientoActual, JSON.stringify(archivosActuales), negocioId]
      });

      return NextResponse.json({
        success: true,
        message: `URL procesada: ${textoExtraido.length} caracteres extraídos`,
        archivos: archivosActuales
      });

    } else if (texto) {
      // Agregar texto manual
      const nuevoContenido = `\n\n=== TEXTO AGREGADO ===\n${texto}`;
      conocimientoActual += nuevoContenido;

      archivosActuales.push({
        nombre: 'Texto manual',
        fecha: new Date().toISOString(),
        caracteres: texto.length,
        tipo: 'texto'
      });

      await db.execute({
        sql: `UPDATE Negocio SET conocimientoBase = ?, conocimientoArchivos = ? WHERE id = ?`,
        args: [conocimientoActual, JSON.stringify(archivosActuales), negocioId]
      });

      return NextResponse.json({
        success: true,
        message: 'Texto agregado correctamente',
        archivos: archivosActuales
      });

    } else {
      return NextResponse.json({ 
        error: 'Se requiere un archivo PDF, texto o URL' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error en POST conocimiento:', error);
    return NextResponse.json({ 
      error: 'Error al procesar el documento',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// DELETE - Limpiar conocimiento
export async function DELETE() {
  try {
    const negocioId = await verifySession();
    if (!negocioId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const db = getDb();
    await db.execute({
      sql: `UPDATE Negocio SET conocimientoBase = '', conocimientoArchivos = '[]' WHERE id = ?`,
      args: [negocioId]
    });

    return NextResponse.json({
      success: true,
      message: 'Base de conocimiento limpiada'
    });

  } catch (error) {
    console.error('Error en DELETE conocimiento:', error);
    return NextResponse.json({ error: 'Error al limpiar conocimiento' }, { status: 500 });
  }
}
