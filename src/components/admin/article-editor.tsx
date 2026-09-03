"use client";

import { useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { toast } from "sonner";
import { uploadAdminImage } from "@/lib/admin-upload";
import { cn } from "@/lib/utils";
import { bodyToHtml } from "@/lib/markdown";
import { cleanupArticleHtml } from "@/lib/article-cleanup";

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times", value: '"Times New Roman", Times, serif' },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Courier", value: '"Courier New", Courier, monospace' },
];

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "32px"];

function ToolbarButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded border px-2 py-1 text-xs font-medium disabled:opacity-40",
        active
          ? "border-navy-800 bg-navy-800 text-white"
          : "border-navy-200 bg-white text-navy-800 hover:bg-navy-50",
      )}
    >
      {children}
    </button>
  );
}

export function ArticleEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        link: { openOnClick: false, defaultProtocol: "https" },
      }),
      TextStyleKit,
      Image.configure({
        HTMLAttributes: { class: "rounded-xl max-w-full" },
      }),
    ],
    content: bodyToHtml(value || ""),
    editorProps: {
      attributes: {
        class: "prose-article min-h-80 px-3 py-2 outline-none",
      },
    },
    onUpdate: ({ editor: next }) => {
      onChange(next.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="mt-1 min-h-80 rounded-md border border-navy-200 bg-white px-3 py-2 text-sm text-slate-400">
        Loading editor…
      </div>
    );
  }

  const headingValue = editor.isActive("heading", { level: 1 })
    ? "1"
    : editor.isActive("heading", { level: 2 })
      ? "2"
      : editor.isActive("heading", { level: 3 })
        ? "3"
        : editor.isActive("heading", { level: 4 })
          ? "4"
          : "p";
  const fontFamily = editor.getAttributes("textStyle").fontFamily ?? "";
  const fontSize = editor.getAttributes("textStyle").fontSize ?? "";
  const color = editor.getAttributes("textStyle").color ?? "#0a1b33";

  return (
    <div className="article-editor mt-1 overflow-hidden rounded-md border border-navy-200 bg-white">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-navy-100 bg-navy-50 p-2">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          Underline
        </ToolbarButton>
        <select
          aria-label="Heading"
          className="h-7 rounded border border-navy-200 bg-white px-1 text-xs"
          value={headingValue}
          onChange={(e) => {
            const next = e.target.value;
            if (next === "p") editor.chain().focus().setParagraph().run();
            else {
              editor
                .chain()
                .focus()
                .toggleHeading({ level: Number(next) as 1 | 2 | 3 | 4 })
                .run();
            }
          }}
        >
          <option value="p">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
        </select>
        <select
          aria-label="Font"
          className="h-7 rounded border border-navy-200 bg-white px-1 text-xs"
          value={fontFamily}
          onChange={(e) => {
            const next = e.target.value;
            if (!next) editor.chain().focus().unsetFontFamily().run();
            else editor.chain().focus().setFontFamily(next).run();
          }}
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font.label} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Font size"
          className="h-7 rounded border border-navy-200 bg-white px-1 text-xs"
          value={fontSize}
          onChange={(e) => {
            const next = e.target.value;
            if (!next) editor.chain().focus().unsetFontSize().run();
            else editor.chain().focus().setFontSize(next).run();
          }}
        >
          <option value="">Size</option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size.replace("px", "")}
            </option>
          ))}
        </select>
        <label className="flex h-7 items-center gap-1 rounded border border-navy-200 bg-white px-1 text-xs text-navy-800">
          Color
          <input
            type="color"
            aria-label="Text color"
            className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0"
            value={/^#/.test(color) ? color : "#0a1b33"}
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
        </label>
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullets
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numbered
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("link")}
          onClick={() => {
            if (editor.isActive("link")) {
              editor.chain().focus().unsetLink().run();
              return;
            }
            const href = window.prompt("Link URL", "https://");
            if (!href) return;
            editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
          }}
        >
          Link
        </ToolbarButton>
        <ToolbarButton onClick={() => imageInputRef.current?.click()}>
          Image
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const next = cleanupArticleHtml(editor.getHTML());
            if (!next) {
              toast.error("Nothing to format");
              return;
            }
            editor.chain().focus().setContent(next).run();
            onChange(editor.getHTML());
            toast.success("Formatting cleaned up — review before saving");
          }}
        >
          Auto-clean
        </ToolbarButton>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            try {
              const url = await uploadAdminImage(file);
              editor.chain().focus().setImage({ src: url }).run();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Upload failed");
            }
          }}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
