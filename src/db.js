import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Add your Supabase PostgreSQL connection string.");
}

// Supabase PostgreSQL connection pooler (Session pooler on port 5432)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: Number(process.env.DB_POOL_MAX || 5),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000
});

const adapter = new PrismaPg(pool);
const rawPrisma = new PrismaClient({ adapter });

// Provide backward compatibility proxy so prisma.shop delegates to prisma.stall
export const prisma = new Proxy(rawPrisma, {
  get(target, prop) {
    if (prop === "shop") return target.stall;
    return target[prop];
  }
});

export default prisma;
