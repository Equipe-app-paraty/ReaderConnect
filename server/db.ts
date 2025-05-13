import "dotenv/config";
import { Pool as PgPool } from "pg";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Configura WebSocket para Neon
neonConfig.webSocketConstructor = ws;

// Escolhe o driver com base no ambiente
const isDevelopment = process.env.NODE_ENV === "development";
const isNeonUrl = process.env.DATABASE_URL.includes("neon.tech");

let pool;
let db;

// Em desenvolvimento local sem URL do Neon, use driver PostgreSQL padrão
if (isDevelopment && !isNeonUrl) {
  console.log("Using standard PostgreSQL driver for local development");
  pool = new PgPool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
}
// Em produção ou com URL do Neon, use driver Neon
else {
  console.log("Using Neon PostgreSQL driver");
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon(pool, { schema });
}

export { pool, db };
