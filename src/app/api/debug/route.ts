import { NextResponse } from 'next/server';
import { tursoQuery } from '@/lib/db';

export async function GET() {
  try {
    // Verificar tablas existentes
    const tables = await tursoQuery(`SELECT name FROM sqlite_master WHERE type='table'`);
    
    // Verificar si hay API keys guardadas
    const apiConfig = await tursoQuery(`SELECT name, isActive, testnet FROM ApiConfig WHERE name = ?`, ['binance']);
    
    return NextResponse.json({
      status: 'connected',
      message: 'Base de datos conectada',
      tables: tables?.rows || [],
      hasApiKeys: apiConfig?.rows?.length > 0,
      apiConfig: apiConfig?.rows || []
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
