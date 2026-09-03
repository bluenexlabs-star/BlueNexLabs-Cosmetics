import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string }>;
}) {
  const { window: windowParam } = await searchParams;
  const days = Number(windowParam ?? 60);
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const due = customers.filter((c) => {
    const last = c.orders[0]?.createdAt;
    return !last || last < cutoff;
  });

  return (
    <div>
      <h1 className="display text-3xl text-navy-900">Customers</h1>
      <p className="mt-2 text-sm text-slate-600">
        Reorder follow-up list — no completed order in the last {days} days
        ({due.length} of {customers.length}). Marketing opt-in is stored for a
        later email tool; this screen is the queue.
      </p>
      <div className="mt-4 flex gap-2 text-sm">
        {[30, 60, 90].map((d) => (
          <a key={d} href={`/admin/customers?window=${d}`} className="rounded-full border px-3 py-1">
            {d} days
          </a>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Orders</th>
              <th className="px-3 py-2">Last order</th>
              <th className="px-3 py-2">Marketing</th>
              <th className="px-3 py-2">Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const last = c.orders[0]?.createdAt;
              const stale = !last || last < cutoff;
              return (
                <tr key={c.id} className="border-t">
                  <td className="px-3 py-2">
                    {c.name}
                    <div className="text-xs text-slate-500">{c.email}</div>
                  </td>
                  <td className="px-3 py-2">{c._count.orders}</td>
                  <td className="px-3 py-2">
                    {last ? last.toLocaleDateString("en-CA") : "Never"}
                  </td>
                  <td className="px-3 py-2">{c.marketingOptIn ? "Opted in" : "No"}</td>
                  <td className="px-3 py-2">
                    {stale ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
                        Due
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
