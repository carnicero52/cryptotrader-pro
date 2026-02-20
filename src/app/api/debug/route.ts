import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/db';

export async function GET() {
  try {
    const turso = getTursoClient();
    
    if (!turso) {
      return NextResponse.json({
        status: 'error',
        error: 'No Turso client available',
        env: {
          hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
          hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
        }
      }, { status: 500 });
    }
    
    // Crear tablas si no existen
    await turso.execute(`
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
    
    await turso.execute(`
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
    
    // Verificar tablas existentes
    const tables = await turso.execute(`SELECT name FROM sqlite_master WHERE type='table'`);
    
    // Verificar si hay API keys guardadas
    const apiConfig = await turso.execute(`SELECT name, isActive, testnet FROM ApiConfig WHERE name = 'binance'`);
    
    return NextResponse.json({
      status: 'connected',
      message: 'Tablas creadas/verificadas',
      tables: tables.rows,
      hasApiKeys: apiConfig.rows.length > 0,
      apiConfig: apiConfig.rows
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: error.stack,
      env: {
        hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
        hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
      }
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
