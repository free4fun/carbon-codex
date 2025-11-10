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

  // one category
  const [cat] = await db
    .insert(categories)
    .values({ slug: "general", name: "General" })
    .onConflictDoNothing()
    .returning({ id: categories.id });
  const categoryId = cat?.id || (await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, "general")).limit(1))[0]?.id as number;

  // one author
  const [authRow] = await db
    .insert(authors)
    .values({ slug: "staff", name: "Staff", bio: "", avatarUrl: null })
    .onConflictDoNothing()
    .returning({ id: authors.id });
  const authorId = authRow?.id || (await db.select({ id: authors.id }).from(authors).where(eq(authors.slug, "staff")).limit(1))[0]?.id as number;

  // one tag
  const [tagRow] = await db
    .insert(tags)
    .values({ slug: "intro", name: "intro" })
    .onConflictDoNothing()
    .returning({ id: tags.id });
  const tagId = tagRow?.id || (await db.select({ id: tags.id }).from(tags).where(eq(tags.slug, "intro")).limit(1))[0]?.id as number;

  // one post group
  const [grp] = await db
    .insert(postGroups)
    .values({ slug: "hello-world", categoryId, authorId, coverUrl: null })
    .onConflictDoNothing()
    .returning({ id: postGroups.id });
  const groupId = grp?.id || (await db.select({ id: postGroups.id }).from(postGroups).where(eq(postGroups.slug, "hello-world")).limit(1))[0]?.id as number;

  // link tag
  await db.insert(postGroupTags).values({ groupId, tagId }).onConflictDoNothing();

  // two locale posts
  await db
    .insert(posts)
    .values([
      {
        groupId,
        locale: "en",
        title: "Hello World",
        bodyMd: "# Hello World\n\nWelcome to the blog!",
        draft: false,
        publishedAt: new Date(),
      },
      {
        groupId,
        locale: "es",
        title: "Hola Mundo",
        bodyMd: "# Hola Mundo\n\n¡Bienvenido al blog!",
        draft: false,
        publishedAt: new Date(),
      },
    ])
    .onConflictDoNothing();

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
