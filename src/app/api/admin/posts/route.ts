import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

async function adminOk() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}

const schema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string(),
  bodyMarkdown: z.string(),
  category: z.string(),
  coverImageUrl: z.string().optional().nullable(),
  published: z.boolean().optional(),
});

export async function POST(req: Request) {
  if (!(await adminOk())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid article" }, { status: 400 });
  }
  const { id, ...data } = parsed.data;
  if (id) {
    await prisma.post.update({
      where: { id },
      data: { ...data, publishedAt: data.published ? new Date() : undefined },
    });
    return NextResponse.json({ id });
  }
  const post = await prisma.post.create({
    data: {
      ...data,
      published: data.published ?? false,
      publishedAt: data.published ? new Date() : new Date(),
    },
  });
  return NextResponse.json({ id: post.id });
}

export async function DELETE(req: Request) {
  if (!(await adminOk())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = z.object({ id: z.string() }).parse(await req.json());
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
