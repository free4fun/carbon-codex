"use client";

import { useState } from "react";

export default function Uploader({
  onUploaded,
  destDir,
  label = "Upload image",
}: {
  onUploaded: (url: string) => void;
  destDir: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("destDir", destDir);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const msg = (await res.json().catch(() => ({})))?.error || res.statusText;
        throw new Error(msg);
      }
      const data = await res.json();
      onUploaded(data.url);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleChange}
        disabled={busy}
        aria-busy={busy}
      />
      {error ? <div role="alert" className="text-sm text-red-500">{error}</div> : null}
    </div>
  );
}
