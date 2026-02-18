import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-libsql';
import { cookies } from 'next/headers';

// Actualizar configuración del negocio
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const db = getDb();

    const sesionResult = await db.execute({
      sql: 'SELECT * FROM Sesion WHERE token = ?',
      args: [token]
    });

    if (sesionResult.rows.length === 0) {
      return NextResponse.json({ error: 'Sesión expirada' }, { status: 401 });
    }

    const sesion = sesionResult.rows[0];
    const data = await request.json();

    await db.execute({
      sql: `UPDATE Negocio SET 
            nombre = ?, telefono = ?, direccion = ?, descripcion = ?,
            puestoBuscado = ?, requisitos = ?, buscandoPersonal = ?,
            whatsapp = ?, facebook = ?, instagram = ?,
            notifTelegramActivo = ?, notifTelegramBotToken = ?, notifTelegramChatId = ?,
            notifEmailActivo = ?, notifEmailSmtp = ?, notifEmailPuerto = ?,
            notifEmailUsuario = ?, notifEmailPassword = ?, notifEmailRemitente = ?,
            notifWhatsappActivo = ?, notifWhatsappApiUrl = ?, notifWhatsappApiKey = ?, notifWhatsappNumero = ?,
            googleSheetsActivo = ?, googleSheetsId = ?, googleSheetsApiKey = ?,
            modoBot = ?, iaProvider = ?, iaApiKey = ?, iaModelo = ?, iaTemperature = ?,
            updatedAt = ?
            WHERE id = ?`,
      args: [
        data.nombre || null, data.telefono || null, data.direccion || null, data.descripcion || null,
        data.puestoBuscado || null, data.requisitos || null, data.buscandoPersonal ? 1 : 0,
        data.whatsapp || null, data.facebook || null, data.instagram || null,
        data.notifTelegramActivo ? 1 : 0, data.notifTelegramBotToken || null, data.notifTelegramChatId || null,
        data.notifEmailActivo ? 1 : 0, data.notifEmailSmtp || null, data.notifEmailPuerto || 587,
        data.notifEmailUsuario || null, data.notifEmailPassword || null, data.notifEmailRemitente || null,
        data.notifWhatsappActivo ? 1 : 0, data.notifWhatsappApiUrl || null, data.notifWhatsappApiKey || null, data.notifWhatsappNumero || null,
        data.googleSheetsActivo ? 1 : 0, data.googleSheetsId || null, data.googleSheetsApiKey || null,
        data.modoBot || 'hibrido', data.iaProvider || 'z-ai', data.iaApiKey || null, data.iaModelo || null, data.iaTemperature ?? 0.7,
        new Date().toISOString(), sesion.negocioId
      ]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
  }
}
