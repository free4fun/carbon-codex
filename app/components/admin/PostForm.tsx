"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Uploader from "./Uploader";
import ImageGallery from "./ImageGallery";
import { calculateReadingTime } from "@/src/lib/sanitizeMarkup";
import { Markdown } from "@/src/lib/markdown";

const FormSchema = z.object({
  // Group fields
  slug: z.string().optional().default(""),
  categoryId: z.union([z.string(), z.null()]).transform(val => val === "" || val === null ? null : val),
  authorId: z.union([z.string(), z.null()]).transform(val => val === "" || val === null ? null : val),
  tags: z.string().optional().default(""),
  coverUrl: z
    .string()
    .refine(
      (val) => !val || val.startsWith("http://") || val.startsWith("https://") || val.startsWith("/"),
      { message: "Invalid url" }
    )
    .optional()
    .nullable(),

  // Locale fields
  locale: z.string().min(2),
  title: z.string().min(1),
  description: z.string().max(500, "Description too long (≤ 500 chars)").optional().default(""),
  bodyMd: z.string().min(1).max(200_000, "Content too large (≤ 200 kB)"),
  readMinutes: z.coerce.number().int().min(0).default(0),
  draft: z.boolean().default(true),
});

export type PostFormValues = z.infer<typeof FormSchema>;

export default function PostForm({
  initial,
  onSubmit,
}: {
  initial?: Partial<PostFormValues>;
  onSubmit: (values: PostFormValues) => Promise<void>;
}) {
  const [tab, setTab] = useState<"form" | "preview">("form");
  const [calculatingMinutes, setCalculatingMinutes] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [authors, setAuthors] = useState<Array<{ id: number; name: string }>>([]);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      slug: "",
      categoryId: "",
      authorId: "",
      tags: "",
      coverUrl: "",
      locale: "en",
      title: "",
      description: "",
      bodyMd: "",
      readMinutes: 0,
      draft: true,
      ...initial,
    },
  });

  const values = watch();

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(r => r.json())
      .then(d => setCategories(d.items || []))
      .catch(console.error);
    fetch("/api/admin/authors")
      .then(r => r.json())
      .then(d => setAuthors(d.items || []))
      .catch(console.error);
  }, []);

  // Ensure selects show correct value after options are loaded
  useEffect(() => {
    if (initial?.categoryId !== undefined && categories.length > 0) {
      setValue("categoryId", initial.categoryId ?? "");
    }
    if (initial?.authorId !== undefined && authors.length > 0) {
      setValue("authorId", initial.authorId ?? "");
    }
  }, [categories, authors]);

  // Switch to preview tab
  const handleTabChange = (t: "form" | "preview") => {
    setTab(t);
  };

  const handleCalculateMinutes = async () => {
    setCalculatingMinutes(true);
    try {
      const minutes = await calculateReadingTime(values.bodyMd || "");
      setValue("readMinutes", minutes, { shouldDirty: true, shouldValidate: true });
    } finally {
      setCalculatingMinutes(false);
    }
  };

  const handleInsertImage = (url: string) => {
    const alt = (typeof window !== "undefined" ? window.prompt("Alt text (optional):", "") : "") || "";
    const markdown = `![${alt}](${url})`;
    // Simply append to bodyMd value
    setValue("bodyMd", (values.bodyMd || "") + "\n" + markdown, { shouldDirty: true, shouldValidate: true });
    setShowGallery(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-6"
      aria-busy={isSubmitting}
    >
      <div className="flex gap-2 border-b">
        {(["form", "preview"] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={`px-3 py-2 -mb-px border-b-2 ${
              tab === t ? "border-[var(--text)] font-semibold" : "border-transparent"
            }`}
            onClick={() => handleTabChange(t)}
            aria-pressed={tab === t}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "form" && (
        <section className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium">Locale</label>
              <input
                {...register("locale")}
                className="mt-1 w-full border rounded px-3 py-2"
                placeholder="en"
                required
              />
              {errors.locale && (
                <div role="alert" className="text-sm text-red-500">
                  {errors.locale.message}
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium">Title</label>
              <input
                {...register("title")}
                className="mt-1 w-full border rounded px-3 py-2"
                placeholder="Post title"
                required
              />
              {errors.title && (
                <div role="alert" className="text-sm text-red-500">
                  {errors.title.message}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              {...register("description")}
              className="mt-1 w-full border rounded px-3 py-2 min-h-[80px]"
              placeholder="Short description for post cards (optional, max 500 chars)"
              maxLength={500}
            />
            <p className="text-xs text-text-gray mt-1">Brief summary shown in post listings</p>
            {errors.description && (
              <div role="alert" className="text-sm text-red-500">
                {errors.description.message}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Slug</label>
            <input
              {...register("slug")}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="my-post-slug (optional)"
            />
            <p className="text-xs text-text-gray mt-1">Auto-generated from title if left empty</p>
            {errors.slug && (
              <div role="alert" className="text-sm text-red-500">
                {errors.slug.message}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Category</label>
              <select
                {...register("categoryId")}
                className="mt-1 w-full border rounded px-3 py-2"
              >
                <option value="">-- None --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Author</label>
              <select
                {...register("authorId")}
                className="mt-1 w-full border rounded px-3 py-2"
              >
                <option value="">-- None --</option>
                {authors.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Tags (comma-separated)</label>
            <input
              {...register("tags")}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="climate, data, ai"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Cover image</label>
              <div className="flex items-center gap-2">
                {values.coverUrl ? (
                  <button type="button" className="px-2 py-1 text-sm rounded border" onClick={() => setValue("coverUrl", "", { shouldDirty: true })}>
                    Clear
                  </button>
                ) : null}
              </div>
            </div>
            {values.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={values.coverUrl} alt="" className="w-full max-w-sm rounded border" />
            ) : (
              <div className="text-sm text-text-gray">No cover yet. Choose one below.</div>
            )}
            <ImageGallery
              destDir="gallery"
              onSelect={(url) => setValue("coverUrl", url, { shouldDirty: true })}
            />
            <input type="hidden" {...register("coverUrl")} />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Post content (Markdown)</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-2 py-1 text-sm rounded border hover:bg-[var(--surface)]"
                  onClick={() => setShowGallery((v) => !v)}
                >
                  {showGallery ? "Hide images" : "Insert image"}
                </button>
              </div>
            </div>
            <textarea
              {...register("bodyMd")}
              className="mt-1 w-full border rounded px-3 py-2 min-h-[300px] font-mono text-sm"
              placeholder="Write in Markdown: # Heading, **bold**, *italic*, [link](url), ![alt](image.jpg), ```code```, etc."
              required
            />
            {errors.bodyMd && (
              <div role="alert" className="text-sm text-red-500">
                {errors.bodyMd.message}
              </div>
            )}
            {showGallery && (
              <div className="mt-3">
                <ImageGallery
                  destDir="gallery"
                  onSelect={handleInsertImage}
                />
              </div>
            )}
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium">Reading time (minutes)</label>
              <input type="number" min={0} {...register("readMinutes", { valueAsNumber: true })} className="mt-1 w-full border rounded px-3 py-2" />
            </div>
            <button
              type="button"
              onClick={handleCalculateMinutes}
              disabled={calculatingMinutes || !values.bodyMd}
              className="px-4 py-2 rounded border hover:bg-[var(--surface)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {calculatingMinutes ? "..." : "Calculate"}
            </button>
          </div>

          <div className="flex gap-6 items-center">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" {...register("draft")} />
              <span>Save as draft</span>
            </label>
            <p className="text-sm text-text-gray">
              If unchecked, the post will be published immediately
            </p>
          </div>
        </section>
      )}

      {tab === "preview" && (
        <section className="grid gap-4">
          <h2 className="text-xl font-semibold">{values.title || "Untitled"}</h2>
          <article className="prose prose-invert max-w-none">
            <Markdown>{values.bodyMd || ""}</Markdown>
          </article>
        </section>
      )}

      <div>
        <button
          type="submit"
          className="px-4 py-2 rounded border hover:bg-[var(--surface)]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
