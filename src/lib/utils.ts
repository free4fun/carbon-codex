// Sanitiza y valida parámetros comunes para consultas
export function sanitizeLocale(locale: string): "en" | "es" {
  return locale === "es" ? "es" : "en";
}

export function sanitizeSlug(slug: string): string {
  // Permite solo letras, números, guiones y subrayados
  return slugify(slug.replace(/[^\w-]+/g, ""));
}

export function sanitizeLimit(limit: any, def = 10, max = 50): number {
  const n = Number(limit);
  if (isNaN(n) || n < 1) return def;
  return Math.min(n, max);
}
export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function parseTags(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(",")
        .map((s) => slugify(s.trim()))
        .filter(Boolean)
    )
  );
}

export function invariant(cond: any, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}
