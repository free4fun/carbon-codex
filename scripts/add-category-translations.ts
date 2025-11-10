import { db } from "../src/db/client";
import { sql } from "drizzle-orm";

async function createCategoryTranslationsTable() {
  try {
    console.log("Creating category_translations table...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "category_translations" (
        "id" bigserial PRIMARY KEY NOT NULL,
        "category_id" bigint NOT NULL,
        "locale" text NOT NULL,
        "name" text NOT NULL,
        "description" text
      )
    `);
    
    await db.execute(sql`
      ALTER TABLE "category_translations" 
      ADD CONSTRAINT "category_translations_category_id_categories_id_fk" 
      FOREIGN KEY ("category_id") REFERENCES "categories"("id") 
      ON DELETE cascade ON UPDATE no action
    `);
    
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "category_translations_category_locale_unique" 
      ON "category_translations" ("category_id","locale")
    `);
    
    console.log("✓ category_translations table created successfully");
  } catch (error) {
    console.error("Error creating table:", error);
    process.exit(1);
  }
  process.exit(0);
}

createCategoryTranslationsTable();
