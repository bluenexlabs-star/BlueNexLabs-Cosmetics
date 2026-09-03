import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login?next=/admin");

  return (
    <div className="min-h-screen bg-navy-50">
      <div className="border-b border-navy-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 text-sm">
          <span className="font-semibold text-navy-900">Admin</span>
          <Link href="/admin" className="hover:underline">
            Orders
          </Link>
          <Link href="/admin/inventory" className="hover:underline">
            Inventory
          </Link>
          <Link href="/admin/articles" className="hover:underline">
            Articles
          </Link>
          <Link href="/admin/customers" className="hover:underline">
            Customers
          </Link>
          <Link href="/" className="ml-auto text-slate-500 hover:underline">
            View store
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
