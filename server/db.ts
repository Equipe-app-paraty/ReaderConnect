import "dotenv/config";
import { Pool as PgPool } from "pg";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Verificar se estamos no ambiente Vercel
const isVercel = process.env.VERCEL === "1";

// Configurar WebSocket apenas em ambiente de desenvolvimento
if (!isVercel) {
  // Importação dinâmica para evitar problemas no ambiente Vercel
  import("ws").then((wsModule) => {
    neonConfig.webSocketConstructor = wsModule.default;
  });
}

let pool;
let db;

// Em ambiente Vercel, sempre use a configuração HTTP-only para Neon
if (isVercel) {
  console.log("Using Neon PostgreSQL driver in HTTP mode (Vercel)");
  pool = new NeonPool({
    connectionString: process.env.DATABASE_URL,
    // Forçar modo HTTP para Vercel
    useSocketIO: false,
  });
  db = drizzleNeon(pool, { schema });
}
// Em desenvolvimento local sem URL do Neon, use driver PostgreSQL padrão
else if (
  process.env.NODE_ENV === "development" &&
  !process.env.DATABASE_URL.includes("neon.tech")
) {
  console.log("Using standard PostgreSQL driver for local development");
  pool = new PgPool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
}
// Em outros casos, use driver Neon com WebSocket
else {
  console.log("Using Neon PostgreSQL driver with WebSocket");
  pool = new NeonPool({
    connectionString: process.env.DATABASE_URL,
  });
  db = drizzleNeon(pool, { schema });
}

export { pool, db };
