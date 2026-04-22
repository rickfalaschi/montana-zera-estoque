// Roda migrations do Drizzle programaticamente durante o build.
// Usado tanto em deploy (Vercel) quanto em CI.
// Idempotente: aplica só o que ainda não foi aplicado (tracking em __drizzle_migrations).
import { migrate } from "drizzle-orm/neon-http/migrator";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const url = process.env.DATABASE_URL;
if (!url) {
  // Em dev sem .env configurado — não falha, só avisa.
  // Em Vercel, DATABASE_URL precisa estar nas variáveis de ambiente.
  console.warn(
    "⚠️  DATABASE_URL não configurada; pulando migrations. Se isso é um deploy, configure a variável de ambiente."
  );
  process.exit(0);
}

const db = drizzle(neon(url));
console.log("→ Aplicando migrations do Drizzle…");
await migrate(db, { migrationsFolder: "./drizzle" });
console.log("✓ Migrations aplicadas.");
