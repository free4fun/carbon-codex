import { NextResponse } from "next/server";

export async function POST() {
  // Client should call next-auth signOut to clear cookies.
  // Here, we just redirect to login page.
  return NextResponse.redirect(new URL("/admin/login", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
