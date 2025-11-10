"use client";

import { useEffect, useState } from "react";
import ImageGallery from "@/src/components/admin/ImageGallery";

// Admin Author shape with optional social URLs
type Author = {
  id: number;
  slug: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  xUrl?: string | null;
  translations?: Array<{ locale: string; bio?: string | null }>;
};

export default function AuthorsAdminPage() {
  const [items, setItems] = useState<Author[]>([]);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [bioEs, setBioEs] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showAvatarGallery, setShowAvatarGallery] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/authors", { cache: "no-store" });
      if (!res.ok) {
        console.error("Failed to load authors:", res.status, res.statusText);
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error loading authors:", error);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(author: Author) {
    setEditId(author.id);
    setSlug(author.slug);
    setName(author.name);
    setBio(author.bio || "");
    
    // Load Spanish translation if it exists
    const esTranslation = author.translations?.find((t) => t.locale === 'es');
    setBioEs(esTranslation?.bio || "");
    
    setAvatarUrl(author.avatarUrl || "");
    setWebsiteUrl(author.websiteUrl || "");
    setLinkedinUrl(author.linkedinUrl || "");
    setGithubUrl(author.githubUrl || "");
    setXUrl(author.xUrl || "");
    setErr(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    
    const translations = [];
    if (bioEs) {
      translations.push({ locale: "es", bio: bioEs });
    }
    
    const payload = { slug, name, bio, avatarUrl, websiteUrl, linkedinUrl, githubUrl, xUrl, translations };
    try {
      let res;
      if (editId) {
        res = await fetch(`/api/admin/authors/${editId}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/authors", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setErr(data?.error || res.statusText);
        } else {
          setErr(res.statusText || "Failed to save");
        }
        return;
      }
      setSlug("");
      setName("");
      setBio("");
      setBioEs("");
      setAvatarUrl("");
      setWebsiteUrl("");
      setLinkedinUrl("");
      setGithubUrl("");
      setXUrl("");
      setEditId(null);
      await load();
    } catch (error: any) {
      setErr(error?.message || "Network error");
    }
  }

  function cancelEdit() {
    setEditId(null);
    setSlug("");
    setName("");
    setBio("");
    setBioEs("");
    setAvatarUrl("");
    setWebsiteUrl("");
    setLinkedinUrl("");
    setGithubUrl("");
    setXUrl("");
    setErr(null);
  }

  async function remove(id: number) {
    try {
      await fetch(`/api/admin/authors/${id}`, { method: "DELETE" });
      await load();
    } catch (error) {
      console.error("Error deleting author:", error);
    }
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Authors</h1>
      <form onSubmit={save} className="grid gap-3 max-w-md">
        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Bio</label>
          <textarea className="mt-1 w-full border rounded px-3 py-2" value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        
        <div className="pt-4 border-t">
          <h3 className="text-sm font-semibold mb-3">Spanish Translation (Optional)</h3>
          <div>
            <label className="block text-sm font-medium">Bio (Spanish)</label>
            <textarea className="mt-1 w-full border rounded px-3 py-2" value={bioEs} onChange={(e) => setBioEs(e.target.value)} placeholder="Biografía en español" />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">Avatar</label>
            <div className="flex items-center gap-2">
              <button type="button" className="px-2 py-1 text-sm rounded border" onClick={() => setShowAvatarGallery((v) => !v)}>
                {showAvatarGallery ? "Hide gallery" : "Choose image"}
              </button>
              {avatarUrl ? (
                <button type="button" className="px-2 py-1 text-sm rounded border" onClick={() => setAvatarUrl("")}>Clear</button>
              ) : null}
            </div>
          </div>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="mt-2 w-28 h-28 object-cover rounded border" />
          ) : null}
          {showAvatarGallery && (
            <div className="mt-2">
              <ImageGallery destDir="gallery" onSelect={(url) => { setAvatarUrl(url); setShowAvatarGallery(false); }} />
            </div>
          )}
          <input type="hidden" value={avatarUrl} onChange={() => {}} />
        </div>
        <div>
          <label className="block text-sm font-medium">Personal Website</label>
          <input className="mt-1 w-full border rounded px-3 py-2" placeholder="https://..." value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">LinkedIn URL</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">GitHub URL</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">X/Twitter URL</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={xUrl} onChange={(e) => setXUrl(e.target.value)} />
        </div>
        {err ? <div role="alert" className="text-sm text-red-500">{err}</div> : null}
        <button type="submit" className="px-4 py-2 rounded border hover:bg-[var(--surface)]">Save</button>
        {editId && (
          <button type="button" className="px-2 py-1 rounded border" onClick={cancelEdit}>Cancel</button>
        )}
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left border-b">
            <tr>
              <th className="py-2 pr-3">Slug</th>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td className="py-2 pr-3">{a.slug}</td>
                <td className="py-2 pr-3">{a.name}</td>
                <td className="py-2 pr-3">
                  <button onClick={() => startEdit(a)} className="underline underline-offset-2 mr-2">Edit</button>
                  <button onClick={() => remove(a.id)} className="underline underline-offset-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
