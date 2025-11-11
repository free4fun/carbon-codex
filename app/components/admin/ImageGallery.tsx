"use client";

import { useEffect, useMemo, useState } from "react";
import Uploader from "./Uploader";

type Item = {
  url: string;
  rel: string;
  filename: string;
  bytes: number;
  mtimeMs: number;
};

export default function ImageGallery({
  destDir,
  onSelect,
  className = "",
}: {
  destDir: string;
  onSelect: (url: string) => void;
  className?: string;
}) {
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.filename.toLowerCase().includes(q));
  }, [items, query]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/upload?dir=${encodeURIComponent(destDir)}&recursive=true`);
      if (!res.ok) {
        const msg = (await res.json().catch(() => ({})))?.error || res.statusText;
        throw new Error(msg);
      }
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to load images");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destDir]);

  async function handleDelete(it: Item) {
    if (!confirm(`Delete ${it.filename}?`)) return;
    try {
      const res = await fetch(`/api/upload?rel=${encodeURIComponent(it.rel)}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || res.statusText);
      await load();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  }

  return (
    <div className={`border rounded-md ${className}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex gap-2">
          {(["library", "upload"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`px-3 py-1.5 rounded border ${tab === t ? "bg-[var(--surface)]" : "bg-transparent"}`}
              onClick={() => setTab(t)}
            >
              {t === "library" ? "Library" : "Upload"}
            </button>
          ))}
        </div>
        {tab === "library" && (
          <div className="flex items-center gap-2">
            <input
              type="search"
              placeholder="Search filename..."
              className="border rounded px-2 py-1 text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" onClick={load} className="px-2 py-1 text-sm border rounded">Reload</button>
          </div>
        )}
      </div>

      {tab === "upload" && (
        <div className="p-3">
          <Uploader
            destDir={destDir}
            label={`Upload image to ${destDir}`}
            onUploaded={() => {
              setTab("library");
              load();
            }}
          />
        </div>
      )}

      {tab === "library" && (
        <div className="p-3">
          {loading ? (
            <div className="text-sm text-text-gray">Loading...</div>
          ) : error ? (
            <div role="alert" className="text-sm text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-text-gray">No images yet. Try Upload.</div>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filtered.map((it) => (
                <li key={it.url} className="group border rounded overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.url}
                    alt={it.filename}
                    className="w-full h-28 object-cover block cursor-pointer group-hover:opacity-80"
                    onClick={() => onSelect(it.url)}
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 px-1.5 py-0.5 text-[11px] rounded bg-red-600 text-white opacity-80 hover:opacity-100"
                    title="Delete image"
                    onClick={(e) => { e.stopPropagation(); handleDelete(it); }}
                  >
                    Delete
                  </button>
                  <div className="px-2 py-1 text-[11px] truncate" title={it.filename}>{it.filename}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
