import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

async function adminOk() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await adminOk())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const schema = z.object({
    stock: z.number().int().min(0).optional(),
    priceCents: z.number().int().min(0).optional(),
    label: z.string().optional(),
  });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  await prisma.variant.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}
