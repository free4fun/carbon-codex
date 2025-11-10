type Tag = { slug: string; name: string };

export default function TagList({
  tags,
  locale,
}: {
  tags: Tag[];
  locale: string;
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <li key={t.slug}>
          <a
            href={`/${locale}/tags/${t.slug}`}
            className="inline-flex items-center rounded-full bg-[var(--surface)] px-3 py-1 text-sm"
          >
            #{t.name}
          </a>
        </li>
      ))}
    </ul>
  );
}
