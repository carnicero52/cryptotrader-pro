import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

let prismaClient: PrismaClient | null = null

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN
  
  if (tursoUrl && tursoToken) {
    try {
      const libsql = createClient({
        url: tursoUrl,
        authToken: tursoToken,
      })
      const adapter = new PrismaLibSql(libsql)
      return new PrismaClient({ adapter })
    } catch (error) {
      console.error('Error creating Prisma client with Turso:', error)
    }
  }
  
  return new PrismaClient()
}

export const db = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!prismaClient) {
      prismaClient = globalForPrisma.prisma || createPrismaClient()
      if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient
    }
    return (prismaClient as any)[prop]
  }
})

// Cliente directo de Turso usando HTTP fetch
export async function tursoQuery(sql: string, args: any[] = []) {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN
  
  if (!tursoUrl || !tursoToken) {
    throw new Error('Turso credentials not configured')
  }
  
  // Convertir URL de libsql a HTTPS
  const httpUrl = tursoUrl.replace('libsql://', 'https://')
  
  const response = await fetch(`${httpUrl}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tursoToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: {
            sql: sql,
            args: args.map(arg => {
              if (arg === null) return { type: 'null' }
              if (typeof arg === 'string') return { type: 'text', value: arg }
              if (typeof arg === 'number') return { type: arg % 1 === 0 ? 'integer' : 'float', value: arg }
              return { type: 'text', value: String(arg) }
            })
          }
        },
        {
          type: 'close'
        }
      ]
    })
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Turso error (${response.status}): ${error}`)
  }
  
  const data = await response.json()
  return data.results?.[0]?.response?.result || data
}

// Inicializar tablas
export async function initTables() {
  await tursoQuery(`
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
  `)
  
  await tursoQuery(`
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
  `)
}
