import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getCurrentUser } from "@/lib/session";

const MAX_BYTES = 5 * 1024 * 1024;
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function isUploadedFile(value: unknown): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as File).arrayBuffer === "function" &&
    typeof (value as File).name === "string"
  );
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!isUploadedFile(file) || file.size === 0) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const extFromName = path.extname(file.name).toLowerCase();
  const extFromType = MIME_TO_EXT[file.type];
  if (!extFromType && !ALLOWED_EXT.has(extFromName)) {
    return NextResponse.json(
      { error: "Only jpg, jpeg, png, webp, and gif are allowed" },
      { status: 400 },
    );
  }
  if (file.type && !extFromType) {
    return NextResponse.json(
      { error: "Only jpg, jpeg, png, webp, and gif are allowed" },
      { status: 400 },
    );
  }

  const ext = extFromType ?? (extFromName === ".jpeg" ? ".jpg" : extFromName);
  const safeBase =
    file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "image";
  const filename = `${Date.now()}-${safeBase}${ext}`;

  const dir = path.join(process.cwd(), "public", "uploads", "articles");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/articles/${filename}` });
}
