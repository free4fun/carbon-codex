import "dotenv/config";
import bcrypt from "bcrypt";
import { db, pool } from "@/src/db/client";
import { users, categories, authors, postGroups, posts, tags, postGroupTags } from "@/src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const adminPass = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const hash = await bcrypt.hash(adminPass, 10);

  // upsert admin user
  await db
    .insert(users)
    .values({ email: adminEmail, passwordHash: hash, isAdmin: true })
    .onConflictDoUpdate({ target: users.email, set: { passwordHash: hash, isAdmin: true } });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
