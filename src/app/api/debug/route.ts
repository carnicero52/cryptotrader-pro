import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Verificar conexión y crear tablas si no existen
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ApiConfig (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE,
        apiKey TEXT,
        apiSecret TEXT,
        isActive INTEGER DEFAULT 0,
        testnet INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT datetime('now'),
        updatedAt TEXT DEFAULT datetime('now')
      )
    `);
    
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS PriceAlert (
        id TEXT PRIMARY KEY,
        symbol TEXT,
        targetPrice REAL,
        condition TEXT,
        message TEXT,
        isActive INTEGER DEFAULT 1,
        triggered INTEGER DEFAULT 0,
        triggeredAt TEXT,
        createdAt TEXT DEFAULT datetime('now'),
        updatedAt TEXT DEFAULT datetime('now')
      )
    `);
    
    // Verificar si existe la tabla ApiConfig
    const tables = await db.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table'
    `;
    
    return NextResponse.json({
      status: 'connected',
      message: 'Tablas creadas/verificadas',
      tables
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
