import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

async function adminOk() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  category: z.string(),
  description: z.string(),
  imageUrl: z.string().optional().nullable(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        sku: z.string(),
        label: z.string(),
        priceCents: z.number().int(),
        stock: z.number().int(),
      }),
    )
    .min(1),
});

export async function POST(req: Request) {
  if (!(await adminOk())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }
  const max = await prisma.product.aggregate({ _max: { sortOrder: true } });
  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      category: parsed.data.category,
      description: parsed.data.description,
      imageUrl: parsed.data.imageUrl,
      active: parsed.data.active ?? true,
      featured: parsed.data.featured ?? false,
      sortOrder: (max._max.sortOrder ?? 0) + 1,
      variants: { create: parsed.data.variants },
    },
  });
  return NextResponse.json({ id: product.id });
}

export async function PATCH(req: Request) {
  if (!(await adminOk())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const id = z.string().parse(body.id);
  await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      category: body.category,
      description: body.description,
      active: body.active,
      featured: body.featured,
      imageUrl: body.imageUrl,
    },
  });
  return NextResponse.json({ ok: true });
}
