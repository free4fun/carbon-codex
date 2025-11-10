import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

// Lazily handle missing DATABASE_URL so modules can be imported at build time without throwing.
// Any attempt to use `db`/`pool` without a configured connection will throw at call-time.
const throwNoDb = () => {
  throw new Error("DATABASE_URL is not set");
};

export const pool: Pool = connectionString
  ? new Pool({ connectionString, max: 10 })
  : (new Proxy({} as any, { get: () => throwNoDb }) as any);

export const db: ReturnType<typeof drizzle<typeof schema>> = connectionString
  ? drizzle(pool, { schema })
  : (new Proxy({} as any, { get: () => throwNoDb }) as any);
