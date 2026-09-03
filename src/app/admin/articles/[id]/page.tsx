import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/article-form";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();
  return (
    <div>
      <h1 className="display text-3xl text-navy-900">Edit article</h1>
      <ArticleForm
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          bodyMarkdown: post.bodyMarkdown,
          category: post.category,
          coverImageUrl: post.coverImageUrl,
          published: post.published,
        }}
      />
    </div>
  );
}
