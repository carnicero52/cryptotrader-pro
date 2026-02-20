import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

let prismaClient: PrismaClient | null = null

function createPrismaClient() {
  // En producción con Turso
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN
  
  console.log('Creating Prisma client...', { 
    hasTursoUrl: !!tursoUrl, 
    hasTursoToken: !!tursoToken,
    tursoUrl: tursoUrl?.substring(0, 30) + '...'
  })
  
  if (tursoUrl && tursoToken) {
    try {
      const libsql = createClient({
        url: tursoUrl,
        authToken: tursoToken,
      })
      const adapter = new PrismaLibSql(libsql)
      const client = new PrismaClient({ adapter })
      console.log('Prisma client created with Turso adapter')
      return client
    } catch (error) {
      console.error('Error creating Prisma client with Turso:', error)
      throw error
    }
  }
  
  // En desarrollo con SQLite local
  console.log('Using local SQLite')
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

// Exportar cliente directo de Turso para operaciones raw
export function getTursoClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN
  
  if (tursoUrl && tursoToken) {
    return createClient({
      url: tursoUrl,
      authToken: tursoToken,
    })
  }
  return null
}
