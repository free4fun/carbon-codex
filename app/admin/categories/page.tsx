"use client";

import { useEffect, useState } from "react";
import ImageGallery from "@/app/components/admin/ImageGallery";

type Category = { 
  id: number; 
  slug: string; 
  name: string; 
  description?: string | null; 
  imageUrl?: string | null;
  translations?: Array<{ locale: string; name: string; description?: string | null }>;
};

export default function CategoriesAdminPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameEs, setNameEs] = useState("");
  const [descriptionEs, setDescriptionEs] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      if (!res.ok) {
        console.error("Failed to load categories:", res.status, res.statusText);
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(category: Category) {
    setEditId(category.id);
    setName(category.name);
    setDescription(category.description || "");
    
    // Load Spanish translation if it exists
    const esTranslation = category.translations?.find((t) => t.locale === 'es');
    setNameEs(esTranslation?.name || "");
    setDescriptionEs(esTranslation?.description || "");
    
    setImageUrl(category.imageUrl || "");
    setErr(null);
  }

  function cancelEdit() {
    setEditId(null);
    setName("");
    setDescription("");
    setNameEs("");
    setDescriptionEs("");
    setImageUrl("");
    setErr(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const translations = [];
      if (nameEs) {
        translations.push({ locale: "es", name: nameEs, description: descriptionEs || null });
      }

      let res;
      if (editId) {
        res = await fetch(`/api/admin/categories/${editId}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name, description, imageUrl, translations }),
        });
      } else {
        res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name, description, imageUrl, translations }),
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
      setName("");
      setDescription("");
      setNameEs("");
      setDescriptionEs("");
      setImageUrl("");
      setEditId(null);
      await load();
    } catch (error: any) {
      setErr(error?.message || "Network error");
    }
  }  async function remove(id: number) {
    try {
      await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      await load();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <form onSubmit={save} className="grid gap-3 max-w-md">
        {editId && (
          <div className="flex items-center justify-between bg-surface/50 px-3 py-2 rounded">
            <span className="text-sm">Editing category</span>
            <button type="button" onClick={cancelEdit} className="text-sm underline">Cancel</button>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
          <p className="text-xs text-text-gray mt-1">Slug will be auto-generated from name</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea className="mt-1 w-full border rounded px-3 py-2 h-28" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional short description" />
        </div>
        
        <div className="pt-4 border-t">
          <h3 className="text-sm font-semibold mb-3">Spanish Translation (Optional)</h3>
          <div className="grid gap-3">
            <div>
              <label className="block text-sm font-medium">Name (Spanish)</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={nameEs} onChange={(e) => setNameEs(e.target.value)} placeholder="Nombre en español" />
            </div>
            <div>
              <label className="block text-sm font-medium">Description (Spanish)</label>
              <textarea className="mt-1 w-full border rounded px-3 py-2 h-28" value={descriptionEs} onChange={(e) => setDescriptionEs(e.target.value)} placeholder="Descripción en español" />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">Image</label>
            <div className="flex items-center gap-2">
              <button type="button" className="px-2 py-1 text-sm rounded border" onClick={() => setShowImageGallery((v) => !v)}>
                {showImageGallery ? "Hide gallery" : "Choose image"}
              </button>
              {imageUrl ? (
                <button type="button" className="px-2 py-1 text-sm rounded border" onClick={() => setImageUrl("")}>Clear</button>
              ) : null}
            </div>
          </div>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="mt-2 w-40 h-24 object-cover rounded border" />
          ) : null}
          {showImageGallery && (
            <div className="mt-2">
              <ImageGallery destDir="gallery" onSelect={(url) => { setImageUrl(url); setShowImageGallery(false); }} />
            </div>
          )}
        </div>
        {err ? <div role="alert" className="text-sm text-red-500">{err}</div> : null}
        <button type="submit" className="px-4 py-2 rounded border hover:bg-[var(--surface)]">
          {editId ? "Update" : "Save"}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left border-b">
            <tr>
              <th className="py-2 pr-3">Slug</th>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Image</th>
              <th className="py-2 pr-3">Description</th>
              <th className="py-2 pr-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="py-2 pr-3">{c.slug}</td>
                <td className="py-2 pr-3">{c.name}</td>
                <td className="py-2 pr-3">
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.imageUrl} alt="" className="w-14 h-10 object-cover rounded border" />
                  ) : (
                    <span className="text-xs text-text-gray">—</span>
                  )}
                </td>
                <td className="py-2 pr-3 max-w-xs">
                  {c.description ? (
                    <span className="text-xs text-text-gray line-clamp-2" title={c.description}>{c.description}</span>
                  ) : (
                    <span className="text-xs text-text-gray">—</span>
                  )}
                </td>
                <td className="py-2 pr-3">
                  <button onClick={() => startEdit(c)} className="underline underline-offset-2 mr-2">Edit</button>
                  <button onClick={() => remove(c.id)} className="underline underline-offset-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
