import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { deleteFile, listUploads, saveMultipart } from "@/src/lib/uploads";
import path from "node:path";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = (await auth()) as any;
  const isAdmin = Boolean(session?.user?.is_admin);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const dir = String(searchParams.get("dir") || "");
  const recursive = String(searchParams.get("recursive") || "true") === "true";
  if (!dir || /\.\./.test(dir)) {
    return NextResponse.json({ error: "Invalid directory" }, { status: 400 });
  }
  try {
    const items = await listUploads(dir, recursive);
    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to list" }, { status: 400 });
  }
}

export async function POST(req: Request) {
  const session = (await auth()) as any;
  const isAdmin = Boolean(session?.user?.is_admin);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const destDir = String(form.get("destDir") || "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File missing" }, { status: 400 });
  }
  if (!destDir || /\.\./.test(destDir)) {
    return NextResponse.json({ error: "Invalid destination" }, { status: 400 });
  }

  try {
    const saved = await saveMultipart(file, destDir);
    return NextResponse.json({ url: saved.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const session = (await auth()) as any;
  const isAdmin = Boolean(session?.user?.is_admin);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const rel = String(searchParams.get("rel") || "");
  if (!rel || /\.\./.test(rel)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  const uploadsDir = process.env.UPLOADS_DIR;
  if (!uploadsDir) {
    return NextResponse.json({ error: "UPLOADS_DIR not configured" }, { status: 500 });
  }
  const abs = path.join(uploadsDir, rel);
  const normalized = path.normalize(abs);
  if (!normalized.startsWith(path.normalize(uploadsDir))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  const ok = await deleteFile(normalized);
  return NextResponse.json({ ok });
}
