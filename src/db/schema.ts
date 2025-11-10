import {
  pgTable,
  serial,
  bigserial,
  bigint,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { customType } from "drizzle-orm/pg-core";

// Custom tsvector type for Drizzle schema typing
export const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

// users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

// authors
export const authors = pgTable("authors", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  websiteUrl: text("website_url"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  xUrl: text("x_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

// author_translations
export const authorTranslations = pgTable(
  "author_translations",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    authorId: bigint("author_id", { mode: "number" })
      .references(() => authors.id, { onDelete: "cascade" })
      .notNull(),
    locale: text("locale").notNull(),
    bio: text("bio"),
  },
  (t) => ({
    uniqAuthorLocale: uniqueIndex("author_translations_author_locale_unique").on(
      t.authorId,
      t.locale
    ),
  })
);

// categories
export const categories = pgTable("categories", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
});

// category_translations
export const categoryTranslations = pgTable(
  "category_translations",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    categoryId: bigint("category_id", { mode: "number" })
      .references(() => categories.id, { onDelete: "cascade" })
      .notNull(),
    locale: text("locale").notNull(),
    name: text("name").notNull(),
    description: text("description"),
  },
  (t) => ({
    uniqCategoryLocale: uniqueIndex("category_translations_category_locale_unique").on(
      t.categoryId,
      t.locale
    ),
  })
);

// tags
export const tags = pgTable("tags", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
});

// post_groups
export const postGroups = pgTable("post_groups", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  slug: text("slug").notNull().unique(),
  categoryId: bigint("category_id", { mode: "number" })
    .references(() => categories.id, { onDelete: "set null" }),
  authorId: bigint("author_id", { mode: "number" })
    .references(() => authors.id, { onDelete: "set null" }),
  coverUrl: text("cover_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

// post_group_tags
export const postGroupTags = pgTable(
  "post_group_tags",
  {
    groupId: bigint("group_id", { mode: "number" })
      .references(() => postGroups.id, { onDelete: "cascade" })
      .notNull(),
    tagId: bigint("tag_id", { mode: "number" })
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => ({
    pk: uniqueIndex("post_group_tags_pk").on(t.groupId, t.tagId),
  })
);

// posts
export const posts = pgTable(
  "posts",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    groupId: bigint("group_id", { mode: "number" })
      .references(() => postGroups.id, { onDelete: "cascade" })
      .notNull(),
    locale: text("locale").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    bodyMd: text("body_md").notNull(),
  readMinutes: bigint("read_minutes", { mode: "number" }),
    draft: boolean("draft").notNull().default(true),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    tsv: tsvector("tsv").$type<string>(),
  },
  (t) => ({
    uniqGroupLocale: uniqueIndex("posts_group_locale_unique").on(
      t.groupId,
      t.locale
    ),
    idxLocale: index("posts_locale_idx").on(t.locale),
    idxPublished: index("posts_published_idx")
      .on(t.publishedAt)
      .where(sql`published_at is not null AND draft = false`),
    idxTsv: index("posts_tsv_idx").on(t.tsv),
  })
);

// Relations for type-safety
export const postsRelations = relations(posts, ({ one }) => ({
  group: one(postGroups, {
    fields: [posts.groupId],
    references: [postGroups.id],
  }),
}));

export const postGroupsRelations = relations(postGroups, ({ one }) => ({
  category: one(categories, {
    fields: [postGroups.categoryId],
    references: [categories.id],
  }),
  author: one(authors, {
    fields: [postGroups.authorId],
    references: [authors.id],
  }),
}));
