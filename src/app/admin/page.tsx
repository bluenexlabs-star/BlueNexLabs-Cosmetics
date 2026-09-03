import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCad } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h1 className="display text-3xl text-navy-900">Incoming orders</h1>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin" className="rounded-full border px-3 py-1">
          All
        </Link>
        {Object.entries(STATUS_LABEL).map(([k, v]) => (
          <Link key={k} href={`/admin?status=${k}`} className="rounded-full border px-3 py-1">
            {v}
          </Link>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="px-3 py-2">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                    {o.number}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  {o.name}
                  <div className="text-xs text-slate-500">{o.email}</div>
                </td>
                <td className="px-3 py-2">{formatCad(o.totalCents)}</td>
                <td className="px-3 py-2">
                  <Badge>{STATUS_LABEL[o.status] ?? o.status}</Badge>
                </td>
                <td className="px-3 py-2 text-slate-500">
                  {o.createdAt.toLocaleString("en-CA")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="p-6 text-center text-slate-500">No orders in this filter.</p>
        )}
      </div>
    </div>
  );
}
