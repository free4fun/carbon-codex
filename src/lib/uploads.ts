import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { invariant, slugify } from "./utils";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function sanitizeFilename(name: string) {
  const ext = path.extname(name).toLowerCase();
  const base = path.basename(name, ext);
  const safeBase = slugify(base);
  return `${safeBase}${ext}`;
}

export async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

export async function saveMultipart(
  file: File,
  destDir: string,
) {
  const uploadsDir = process.env.UPLOADS_DIR;
  const base = process.env.UPLOADS_BASE || "/uploads";
  invariant(uploadsDir, "UPLOADS_DIR is not set");
  invariant(ALLOWED.has(file.type), "Unsupported MIME type");
  invariant(file.size <= MAX_SIZE, "File too large");

  const arrayBuf = await file.arrayBuffer();
  const buf = Buffer.from(arrayBuf);

  const safeName = sanitizeFilename(file.name ?? "upload");
  const dir = path.join(uploadsDir!, destDir);
  await ensureDir(dir);
  const destPath = path.join(dir, safeName);
  await fs.writeFile(destPath, buf, { mode: 0o644 });

  // Build public URL: base + destDir + filename
  const urlPath = path.posix.join(base, destDir.split(path.sep).join("/"), safeName);
  return {
    path: destPath,
    url: urlPath,
    filename: safeName,
    bytes: buf.length,
    mime: file.type,
  };
}

export async function deleteFile(absPath: string) {
  try {
    await fs.unlink(absPath);
    return true;
  } catch {
    return false;
  }
}

export async function moveUploads(oldDir: string, newDir: string) {
  const uploadsDir = process.env.UPLOADS_DIR;
  invariant(uploadsDir, "UPLOADS_DIR is not set");
  if (!oldDir || !newDir || /\.\./.test(oldDir) || /\.\./.test(newDir)) {
    throw new Error("Invalid directory paths");
  }

  const oldAbs = path.join(uploadsDir!, oldDir);
  const newAbs = path.join(uploadsDir!, newDir);
  
  // Ensure paths stay within uploads root
  const normalizedOld = path.normalize(oldAbs);
  const normalizedNew = path.normalize(newAbs);
  const normalizedRoot = path.normalize(uploadsDir!);
  
  if (!normalizedOld.startsWith(normalizedRoot) || !normalizedNew.startsWith(normalizedRoot)) {
    throw new Error("Invalid directory paths");
  }

  // Check if old directory exists
  try {
    await fs.access(normalizedOld);
  } catch {
    // Old directory doesn't exist, nothing to move
    return false;
  }

  // Check if new directory already exists
  try {
    await fs.access(normalizedNew);
    // New directory exists, don't overwrite
    return false;
  } catch {
    // New directory doesn't exist, proceed with move
  }

  // Ensure parent of new directory exists
  await ensureDir(path.dirname(normalizedNew));
  
  // Move directory
  await fs.rename(normalizedOld, normalizedNew);
  return true;
}

export function rewriteImageUrl(url: string | null, oldDir: string, newDir: string): string | null {
  if (!url) return null;
  const base = process.env.UPLOADS_BASE || "/uploads";
  
  // Normalize directory paths to posix for URL matching
  const oldPath = path.posix.join(base, oldDir);
  const newPath = path.posix.join(base, newDir);
  
  // Check if URL contains the old path
  if (url.includes(oldPath)) {
    return url.replace(oldPath, newPath);
  }
  
  return url;
}

export interface UploadItem {
  path: string;         // absolute path on disk
  url: string;          // public URL
  rel: string;          // relative path under UPLOADS_DIR (posix)
  filename: string;     // file name
  bytes: number;        // size in bytes
  mtimeMs: number;      // last modified
}

async function walk(dir: string, results: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(p, results);
    } else {
      results.push(p);
    }
  }
  return results;
}

export async function listUploads(dir: string, recursive = true): Promise<UploadItem[]> {
  const uploadsDir = process.env.UPLOADS_DIR;
  const base = process.env.UPLOADS_BASE || "/uploads";
  invariant(uploadsDir, "UPLOADS_DIR is not set");

  const abs = path.join(uploadsDir!, dir);
  // Ensure dir stays within uploads root
  const normalized = path.normalize(abs);
  if (!normalized.startsWith(path.normalize(uploadsDir!))) {
    throw new Error("Invalid directory");
  }

  // If directory doesn't exist yet, return empty list
  try {
    await fs.access(normalized);
  } catch {
    return [];
  }

  const filePaths = recursive
    ? await walk(normalized)
    : (await fs.readdir(normalized, { withFileTypes: true }))
        .filter((e) => e.isFile())
        .map((e) => path.join(normalized, e.name));

  const items: UploadItem[] = [];
  for (const p of filePaths) {
    // Filter to allowed mime extensions only
    const ext = path.extname(p).toLowerCase();
    if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) continue;
    const st = await fs.stat(p);
    const relFromRoot = path.relative(uploadsDir!, p).split(path.sep).join("/");
    const urlPath = path.posix.join(base, relFromRoot);
    items.push({
      path: p,
      url: urlPath,
      rel: relFromRoot,
      filename: path.basename(p),
      bytes: st.size,
      mtimeMs: st.mtimeMs,
    });
  }
  // Newest first
  items.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return items;
}
