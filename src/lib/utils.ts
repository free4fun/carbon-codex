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
