import Link from "next/link";
import type { Metadata } from "next";
import { articleImageSrc } from "@/lib/article-image";
import { prisma } from "@/lib/prisma";
import { postSearchWhere } from "@/lib/search";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Research knowledge hub" };

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      ...(q ? postSearchWhere(q) : {}),
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
        Knowledge hub
      </p>
      <h1 className="display mt-1 text-3xl text-navy-900">
        Research notes for Canadian labs
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Storage, testing, legality context, and peptide science primers. These
        articles are educational and do not constitute medical advice.
      </p>
      <form className="mt-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search articles…"
          className="h-10 w-full max-w-md rounded-md border border-navy-200 px-3 text-sm"
        />
      </form>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const imageSrc = articleImageSrc(post.slug, post.coverImageUrl);
          return (
            <Link
              key={post.id}
              href={`/research/${post.slug}`}
              className="overflow-hidden rounded-xl border border-navy-100 bg-white hover:shadow-sm"
            >
              {imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageSrc}
                  alt=""
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="h-44 bg-navy-50" />
              )}
              <div className="p-5">
                <p className="text-xs uppercase tracking-wide text-cyan-800">
                  {post.category} · {post.publishedAt.toLocaleDateString("en-CA")}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-navy-900">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
