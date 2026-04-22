import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/lib/db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const client = neon(process.env.DATABASE_URL);

export const db = drizzle(client, { schema, casing: "snake_case" });
export { schema };

// Acesso a SQL raw ainda disponível via `db.execute(sql\`...\`)` com `sql` de drizzle-orm.
