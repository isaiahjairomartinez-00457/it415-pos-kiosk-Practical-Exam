import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

/**
 * Builds the MySQL/MariaDB connection from DATABASE_URL.
 * Only the server ever imports this file — credentials never reach the browser.
 *
 * Local (XAMPP):  mysql://root:@localhost:3306/it415_pos_kiosk
 * Hosted (Vercel): any public MySQL-compatible URL; append ?ssl=true if the provider requires TLS.
 */
function createClient(): PrismaClient {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and adjust it.");
  }
  const url = new URL(raw);
  const adapter = new PrismaMariaDb({
    host: url.hostname === "localhost" ? "127.0.0.1" : url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit: 5,
    ssl: url.searchParams.get("ssl") === "true" ? { rejectUnauthorized: true } : undefined,
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
