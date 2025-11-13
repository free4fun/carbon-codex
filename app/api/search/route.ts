import { NextResponse } from "next/server";
import { searchPosts } from "@/src/lib/blog";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const locale = searchParams.get("locale") || "en";
  const results = await searchPosts(locale, q, 24);
  return NextResponse.json({ results });
}
