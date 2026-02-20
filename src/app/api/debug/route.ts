import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Verificar conexión
    const result = await db.$queryRaw`SELECT 1 as test`;
    
    // Verificar si existe la tabla ApiConfig
    const tables = await db.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name='ApiConfig'
    `;
    
    return NextResponse.json({
      status: 'connected',
      tablesExist: Array.isArray(tables) && tables.length > 0,
      result
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
