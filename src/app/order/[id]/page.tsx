import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCad } from "@/lib/utils";
import { SITE, STATUS_LABEL } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { number: id }],
    },
    include: { items: true },
  });
  if (!order) notFound();
  if (order.userId && user?.userId !== order.userId && user?.role !== "ADMIN") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
        Order received
      </p>
      <h1 className="display mt-1 text-3xl text-navy-900">{order.number}</h1>
      <div className="mt-3">
        <Badge>{STATUS_LABEL[order.status] ?? order.status}</Badge>
      </div>
      <div className="mt-6 rounded-xl border border-cyan-200 bg-cyan-50 p-5 text-sm leading-6 text-navy-900">
        <p className="font-semibold">Pay by Interac e-Transfer</p>
        <p className="mt-2">
          Send <strong>{formatCad(order.totalCents)}</strong> to{" "}
          <strong>{SITE.interacEmail}</strong>. Use {order.number} as the
          security question / message. We mark the order paid after the transfer
          arrives, then Canada Post tracking is emailed within 24 hours.
        </p>
      </div>
      <ul className="mt-6 divide-y rounded-xl border border-navy-100 bg-white">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between px-4 py-3 text-sm">
            <span>
              {item.name} ({item.label}) × {item.qty}
            </span>
            <span>{formatCad(item.unitCents * item.qty)}</span>
          </li>
        ))}
        <li className="flex justify-between px-4 py-3 text-sm">
          <span>Shipping</span>
          <span>
            {order.shippingCents === 0 ? "Free" : formatCad(order.shippingCents)}
          </span>
        </li>
        <li className="flex justify-between px-4 py-3 font-semibold">
          <span>Total</span>
          <span>{formatCad(order.totalCents)}</span>
        </li>
      </ul>
      <p className="mt-4 text-sm text-slate-600">
        Shipping to {order.addressLine1}, {order.city}, {order.province}{" "}
        {order.postalCode}. Confirmation also appears in your account if you
        ordered while signed in. Orders are subject to our{" "}
        <Link href="/terms" className="underline">
          Terms and Conditions
        </Link>
        .
      </p>
    </div>
  );
}
