CREATE TABLE "author_translations" (
  "id" bigserial PRIMARY KEY NOT NULL,
  "author_id" bigint NOT NULL REFERENCES "authors"("id") ON DELETE CASCADE,
  "locale" text NOT NULL,
  "bio" text
);

CREATE UNIQUE INDEX "author_translations_author_locale_unique" ON "author_translations" ("author_id", "locale");
