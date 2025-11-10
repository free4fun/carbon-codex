import AdminNav from "@/src/components/admin/Nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-6 flex-1">{children}</main>
    </div>
  );
}
