import "dotenv/config";
import { Pool as PgPool } from "pg";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Detectar o ambiente Vercel de forma mais confiável
// Aceita tanto VERCEL=1 quanto qualquer valor definido para VERCEL
const isVercel = Boolean(process.env.VERCEL);

// Fornecer mais informações no log
console.log("Ambiente de execução:", {
  isVercel,
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL ? "Definido" : "Não definido",
});

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
  console.log("Conectando ao Neon no modo HTTP (Vercel)");
  try {
    pool = new NeonPool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      // Remove useSocketIO since it's not a valid option for NeonPool
      connectionTimeoutMillis: 10000,
    });
    console.log("Pool de conexão criado com sucesso");
    db = drizzleNeon(pool, { schema });
    console.log("Instância do Drizzle criada com sucesso");
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
    throw error;
  }
}
// Em desenvolvimento local sem URL do Neon, use driver PostgreSQL padrão
else if (
  process.env.NODE_ENV === "development" &&
  !process.env.DATABASE_URL.includes("neon.tech")
) {
  console.log("Using standard PostgreSQL driver for local development");
  try {
    pool = new PgPool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
    console.log("Conexão local com PostgreSQL estabelecida com sucesso");
  } catch (error) {
    console.error("Erro ao conectar ao PostgreSQL local:", error);
    throw error;
  }
}
// Em outros casos, use driver Neon com WebSocket
else {
  console.log("Using Neon PostgreSQL driver with WebSocket");
  try {
    pool = new NeonPool({
      connectionString: process.env.DATABASE_URL,
    });
    db = drizzleNeon(pool, { schema });
    console.log("Conexão com Neon via WebSocket estabelecida com sucesso");
  } catch (error) {
    console.error("Erro ao conectar ao Neon via WebSocket:", error);
    throw error;
  }
}

export { db, pool };
