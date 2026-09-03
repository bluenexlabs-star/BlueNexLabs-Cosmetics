import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCad } from "@/lib/utils";
import { OrderStatusForm } from "@/components/admin/order-status-form";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border bg-white p-5">
        <h1 className="display text-2xl">{order.number}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {order.name} · {order.email} · {order.phone}
        </p>
        <p className="mt-2 text-sm">
          {order.addressLine1}
          {order.addressLine2 ? `, ${order.addressLine2}` : ""}
          <br />
          {order.city}, {order.province} {order.postalCode}
        </p>
        <ul className="mt-4 space-y-1 text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between">
              <span>
                {i.name} ({i.label}) × {i.qty}
              </span>
              <span>{formatCad(i.unitCents * i.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 font-semibold">Total {formatCad(order.totalCents)}</p>
        {order.notes && <p className="mt-3 text-sm text-slate-500">{order.notes}</p>}
      </div>
      <OrderStatusForm
        orderId={order.id}
        status={order.status}
        trackingNumber={order.trackingNumber}
        notes={order.notes}
      />
    </div>
  );
}
