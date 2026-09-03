import { cleanupArticleHtml } from "@/lib/article-cleanup";
import { cleanupProductDescription } from "@/lib/product-description-cleanup";

export function looksLikeHtml(body: string) {
  return /^\s*</.test(body);
}

export function sanitizeHtml(html: string) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

export function bodyToHtml(body: string) {
  return sanitizeHtml(cleanupArticleHtml(body) || markdownToHtml(body));
}

export function productDescriptionToHtml(md: string) {
  return sanitizeHtml(markdownToHtml(md));
}

export function markdownToHtml(md: string) {
  const cleaned = cleanupProductDescription(md);

  const escaped = cleaned
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(/^###### (.*)$/gm, "<h6>$1</h6>")
    .replace(/^##### (.*)$/gm, "<h5>$1</h5>")
    .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>')
    .replace(/^\s*[-*•] (.*)$/gm, "<li>$1</li>")
    .replace(/(?:<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    .replace(/^(?!<h|<ul|<li|<p|<img|<\/)(.+)$/gm, "<p>$1</p>")
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/\n{3,}/g, "\n\n");
}
