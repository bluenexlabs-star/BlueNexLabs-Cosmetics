import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

async function admin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await admin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const schema = z.object({
    status: z.enum(["pending_payment", "paid", "shipped", "completed", "cancelled"]).optional(),
    trackingNumber: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (parsed.data.status === "cancelled" && existing.status !== "cancelled") {
    await prisma.$transaction(async (tx) => {
      for (const item of existing.items) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.qty } },
        });
      }
      await tx.order.update({
        where: { id },
        data: parsed.data,
      });
    });
  } else {
    await prisma.order.update({ where: { id }, data: parsed.data });
  }

  return NextResponse.json({ ok: true });
}
