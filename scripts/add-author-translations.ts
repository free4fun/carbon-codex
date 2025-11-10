import { db } from "../src/db/client";
import { sql } from "drizzle-orm";

async function addAuthorTranslations() {
  console.log("Creating author_translations table...");

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "author_translations" (
        "id" bigserial PRIMARY KEY NOT NULL,
        "author_id" bigint NOT NULL REFERENCES "authors"("id") ON DELETE CASCADE,
        "locale" text NOT NULL,
        "bio" text
      );
    `);

    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "author_translations_author_locale_unique" 
      ON "author_translations" ("author_id", "locale");
    `);

    console.log("✓ author_translations table created successfully");
  } catch (error) {
    console.error("Error creating author_translations table:", error);
    throw error;
  }
}

addAuthorTranslations()
  .then(() => {
    console.log("Migration completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
