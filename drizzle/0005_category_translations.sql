CREATE TABLE IF NOT EXISTS "category_translations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"category_id" bigint NOT NULL,
	"locale" text NOT NULL,
	"name" text NOT NULL,
	"description" text
);

ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE cascade ON UPDATE no action;

CREATE UNIQUE INDEX IF NOT EXISTS "category_translations_category_locale_unique" ON "category_translations" ("category_id","locale");
