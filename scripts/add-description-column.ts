import { db } from "../src/db/client";
import { sql } from "drizzle-orm";

async function addDescriptionColumn() {
  try {
    console.log("Adding description column to categories...");
    await db.execute(sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS description text`);
    console.log("✓ Description column added successfully");
  } catch (error) {
    console.error("Error adding column:", error);
    process.exit(1);
  }
  process.exit(0);
}

addDescriptionColumn();
