import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

let prismaClient: PrismaClient | null = null

function createPrismaClient() {
  // En producción con Turso
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN
  
  if (tursoUrl && tursoToken) {
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    })
    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({ adapter })
  }
  
  // En desarrollo con SQLite local
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
