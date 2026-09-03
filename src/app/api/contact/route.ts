import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    message: z.string().min(8),
  });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete the form." }, { status: 400 });
  }
  console.info("Contact message", parsed.data);
  return NextResponse.json({ ok: true });
}
