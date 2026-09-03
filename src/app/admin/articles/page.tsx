import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const posts = await prisma.post.findMany({ orderBy: { publishedAt: "desc" } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="display text-3xl text-navy-900">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="rounded-md bg-navy-900 px-3 py-2 text-sm text-white"
        >
          New article
        </Link>
      </div>
      <div className="mt-6 divide-y rounded-xl border bg-white">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/admin/articles/${p.id}`}
            className="flex items-center justify-between px-4 py-3 text-sm hover:bg-navy-50"
          >
            <span>
              <span className="font-medium">{p.title}</span>
              <span className="ml-2 text-slate-500">{p.slug}</span>
            </span>
            <span className="text-xs uppercase text-slate-500">
              {p.published ? "Published" : "Draft"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
