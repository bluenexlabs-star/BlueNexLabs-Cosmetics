import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { articleImageSrc } from "@/lib/article-image";
import { isLegacyPostSlug } from "@/lib/legacy-catalog";
import { prisma } from "@/lib/prisma";
import { bodyToHtml } from "@/lib/markdown";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (isLegacyPostSlug(slug)) return { title: "Article" };
  const post = await prisma.post.findUnique({ where: { slug } });
  return { title: post?.title ?? "Article" };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (isLegacyPostSlug(slug)) notFound();
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || !post.published) notFound();

  const imageSrc = articleImageSrc(post.slug, post.coverImageUrl);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs uppercase tracking-wide text-cyan-800">
        {post.category} · {post.publishedAt.toLocaleDateString("en-CA")}
      </p>
      <h1 className="display mt-2 text-3xl text-navy-900 sm:text-4xl">
        {post.title}
      </h1>
      {imageSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt=""
          className="mt-6 w-full rounded-xl object-cover"
        />
      )}
      <div
        className="prose-article mt-8"
        dangerouslySetInnerHTML={{ __html: bodyToHtml(post.bodyMarkdown) }}
      />
      <p className="mt-10 rounded-lg bg-amber-50 p-4 text-sm text-amber-950">
        Educational only. BlueNex Labs does not provide medical or treatment
        advice. Cosmetic products are for topical skin care — follow each
        product label.
      </p>
    </article>
  );
}
