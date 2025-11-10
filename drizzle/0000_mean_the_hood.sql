CREATE TABLE IF NOT EXISTS "authors" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"bio" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "authors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_group_tags" (
	"group_id" bigint NOT NULL,
	"tag_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_groups" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"category_id" bigint,
	"author_id" bigint,
	"cover_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "post_groups_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"group_id" bigint NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"body_md" text NOT NULL,
	"draft" boolean DEFAULT true NOT NULL,
	"published_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tsv" "tsvector"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_group_tags" ADD CONSTRAINT "post_group_tags_group_id_post_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."post_groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_group_tags" ADD CONSTRAINT "post_group_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_groups" ADD CONSTRAINT "post_groups_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_groups" ADD CONSTRAINT "post_groups_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_group_id_post_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."post_groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "post_group_tags_pk" ON "post_group_tags" USING btree ("group_id","tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "posts_group_locale_unique" ON "posts" USING btree ("group_id","locale");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_locale_idx" ON "posts" USING btree ("locale");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_published_idx" ON "posts" USING btree ("published_at") WHERE published_at is not null AND draft = false;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_tsv_idx" ON "posts" USING btree ("tsv");