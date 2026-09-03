"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArticleEditor } from "@/components/admin/article-editor";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { uploadAdminImage } from "@/lib/admin-upload";

type PostInput = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyMarkdown: string;
  category: string;
  coverImageUrl: string | null;
  published: boolean;
};

export function ArticleForm({ post }: { post?: PostInput }) {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? "");
  const [bodyMarkdown, setBodyMarkdown] = useState(post?.bodyMarkdown ?? "");

  return (
    <form
      className="mt-6 space-y-4 rounded-xl border bg-white p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const body = bodyMarkdown.replace(/<p><\/p>/g, "").trim();
        if (!body) {
          toast.error("Body is required");
          return;
        }
        setPending(true);
        const res = await fetch("/api/admin/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: post?.id,
            title: form.get("title"),
            slug: form.get("slug"),
            excerpt: form.get("excerpt"),
            bodyMarkdown,
            category: form.get("category"),
            coverImageUrl: coverImageUrl || null,
            published: Boolean(form.get("published")),
          }),
        });
        setPending(false);
        if (!res.ok) toast.error("Could not save article");
        else {
          toast.success("Article saved");
          router.push("/admin/articles");
          router.refresh();
        }
      }}
    >
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={post?.title} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" required defaultValue={post?.slug} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" defaultValue={post?.category ?? "Research"} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="coverImageUrl">Cover image URL</Label>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Input
            id="coverImageUrl"
            name="coverImageUrl"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://… or /uploads/articles/…"
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => coverInputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Upload image"}
          </Button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setUploading(true);
              try {
                const url = await uploadAdminImage(file);
                setCoverImageUrl(url);
                toast.success("Cover image uploaded");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Upload failed");
              } finally {
                setUploading(false);
              }
            }}
          />
        </div>
        {coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImageUrl}
            alt=""
            className="mt-3 max-h-40 rounded-lg object-cover"
          />
        )}
      </div>
      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <textarea
          id="excerpt"
          name="excerpt"
          defaultValue={post?.excerpt}
          className="mt-1 min-h-20 w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>
      <div>
        <Label htmlFor="bodyMarkdown">Body</Label>
        <p className="mt-1 text-xs text-slate-500">
          Use Auto-clean in the toolbar to restore headings, paragraphs, and lists
          from flattened or pasted text. Review the result before saving.
        </p>
        <ArticleEditor value={post?.bodyMarkdown ?? ""} onChange={setBodyMarkdown} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={post?.published ?? true} />
        Published
      </label>
      <Button disabled={pending}>{pending ? "Saving…" : "Save article"}</Button>
    </form>
  );
}
