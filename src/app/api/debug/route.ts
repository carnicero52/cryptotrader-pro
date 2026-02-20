import { NextResponse } from 'next/server';
import { tursoQuery, initTables } from '@/lib/db';

export async function GET() {
  try {
    // Crear tablas si no existen
    await initTables();
    
    // Verificar tablas existentes
    const tables = await tursoQuery(`SELECT name FROM sqlite_master WHERE type='table'`);
    
    // Verificar si hay API keys guardadas
    const apiConfig = await tursoQuery(`SELECT name, isActive, testnet FROM ApiConfig WHERE name = ?`, ['binance']);
    
    return NextResponse.json({
      status: 'connected',
      message: 'Tablas creadas/verificadas',
      tables: tables.rows || tables,
      hasApiKeys: Array.isArray(apiConfig?.rows) ? apiConfig.rows.length > 0 : false,
      apiConfig: apiConfig?.rows || apiConfig
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      env: {
        hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
        hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
      }
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
