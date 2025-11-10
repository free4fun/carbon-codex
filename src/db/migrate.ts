/**
 * Run Drizzle migrations and ensure FTS column and indexes exist.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

// Use individual connection params to avoid URL parsing issues with special chars
const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
});

const db = drizzle(pool);

async function main() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });

  // Ensure generated tsvector column and GIN index exist (idempotent)
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='posts' AND column_name='tsv'
      ) THEN
        ALTER TABLE posts
        ADD COLUMN tsv tsvector GENERATED ALWAYS AS (
          to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(body_md,''))
        ) STORED;
      END IF;
    END$$;
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS posts_tsv_idx ON posts USING GIN (tsv);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS posts_published_idx
    ON posts (published_at)
    WHERE published_at IS NOT NULL AND draft = false;
  `);

  console.log("Migrations complete.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
