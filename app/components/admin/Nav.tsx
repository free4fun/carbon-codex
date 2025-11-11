"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/authors", label: "Authors" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-4 border-b px-4 py-3">
      {links.map((l) => {
        const active = pathname === l.href || pathname?.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            className={active ? "font-semibold underline" : "hover:underline"}
          >
            {l.label}
          </Link>
        );
      })}
      <form method="POST" action="/admin/logout" className="ml-auto">
        <button
          type="submit"
          className="px-3 py-1 rounded border hover:bg-[var(--surface)]"
          aria-label="Sign out"
        >
          Logout
        </button>
      </form>
    </nav>
  );
}
