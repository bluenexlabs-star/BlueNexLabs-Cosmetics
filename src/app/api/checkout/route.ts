import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { shippingCents } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional().nullable(),
  city: z.string().min(2),
  province: z.string().min(2),
  postalCode: z.string().min(3),
  notes: z.string().optional().nullable(),
  ruoAccepted: z.literal(true),
  lines: z.array(z.object({ variantId: z.string(), qty: z.number().int().positive() })).min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }
  const data = parsed.data;
  const requireAccount = process.env.REQUIRE_CUSTOMER_ACCOUNT === "true";
  const session = await getSession();
  if (requireAccount && !session.user) {
    return NextResponse.json({ error: "Sign in to checkout." }, { status: 401 });
  }

  const variants = await prisma.variant.findMany({
    where: { id: { in: data.lines.map((l) => l.variantId) } },
    include: { product: true },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));

  let subtotal = 0;
  const items: {
    variantId: string;
    name: string;
    sku: string;
    label: string;
    qty: number;
    unitCents: number;
  }[] = [];
  for (const line of data.lines) {
    const variant = byId.get(line.variantId);
    if (!variant || !variant.product.active) {
      return NextResponse.json({ error: "A product in your cart is no longer available." }, { status: 400 });
    }
    if (variant.stock < line.qty) {
      return NextResponse.json(
        { error: `${variant.product.name} (${variant.label}) only has ${variant.stock} in stock.` },
        { status: 409 },
      );
    }
    subtotal += variant.priceCents * line.qty;
    items.push({
      variantId: variant.id,
      name: variant.product.name,
      sku: variant.sku,
      label: variant.label,
      qty: line.qty,
      unitCents: variant.priceCents,
    });
  }

  const shipping = shippingCents(subtotal);
  const total = subtotal + shipping;
  const count = await prisma.order.count();
  const number = `BNL-${String(count + 10001).padStart(5, "0")}`;

  const order = await prisma.$transaction(async (tx) => {
    for (const line of data.lines) {
      const updated = await tx.variant.update({
        where: { id: line.variantId },
        data: { stock: { decrement: line.qty } },
      });
      if (updated.stock < 0) {
        throw new Error("stock");
      }
    }
    return tx.order.create({
      data: {
        number,
        userId: session.user?.userId,
        email: data.email,
        name: data.name,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode.toUpperCase(),
        notes: data.notes || null,
        ruoAccepted: true,
        subtotalCents: subtotal,
        shippingCents: shipping,
        totalCents: total,
        items: { create: items },
      },
    });
  }).catch((err) => {
    if (String(err.message).includes("stock")) return null;
    throw err;
  });

  if (!order) {
    return NextResponse.json({ error: "Stock changed while you were checking out. Refresh and try again." }, { status: 409 });
  }

  return NextResponse.json({ orderId: order.id, number: order.number });
}
