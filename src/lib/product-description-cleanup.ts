/**
 * Tightens CMS/Squarespace-exported product markdown.
 *
 * Conservative: does not invent scientific claims. It only repairs structure
 * already implied by the source (split list markers, leftover nav headings,
 * leftover CSS, indent/blank-line noise, heading-only bold wrappers).
 *
 * Safe to run more than once.
 */

const LEFTOVER_UNWRAP_HREFS =
  /^(?:https?:\/\/[^/]*squarespace[^/]*\/.*|\/order-here|\/home)\/?$/i;

export function cleanupProductDescription(input: string): string {
  const raw = stripJunk(input);
  if (!raw) return "";

  if (looksLikeHtml(raw)) {
    return normalizeProductHtml(raw);
  }

  return tightenSpacing(normalizeInline(joinOrphanMarkers(raw)));
}

function looksLikeHtml(input: string): boolean {
  return /^\s*</.test(input) && /<(p|h[1-6]|ul|ol|li|blockquote)\b/i.test(input);
}

function stripJunk(input: string): string {
  return input
    .replace(/\u200b|\u200c|\u200d|\ufeff/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n\s*#block-[\s\S]*$/g, "")
    .replace(/\\n#block-[\s\S]*$/g, "")
    .replace(/\s*#block-[a-z0-9]+[\s\S]*$/gi, "")
    .replace(/^#{1,6}\s*\[(?:\*\*)?ORDER HERE(?:\*\*)?\][^\n]*\n*/gim, "")
    .replace(/^\[(?:\*\*)?ORDER HERE(?:\*\*)?\][^\n]*\n*/gim, "")
    .trim();
}

function nextNonEmpty(lines: string[], from: number): number {
  for (let i = from; i < lines.length; i++) {
    if (lines[i]?.trim()) return i;
  }
  return -1;
}

function isHeadingLine(line: string): boolean {
  return /^#{1,6}\s+\S/.test(line.trim());
}

function isListLine(line: string): boolean {
  return /^\s*(?:[-•]|\*(?!\*)|[✅☑️✔]|[0-9]+\.)\s+\S/.test(line);
}

function startsWithListMarker(line: string): boolean {
  const trimmed = line.trimStart();
  if (trimmed.startsWith("**")) return false;
  return /^[-*•](?:\s|$)/.test(trimmed);
}

function joinOrphanMarkers(md: string): string {
  const rawLines = md.split("\n");
  const lines: string[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i] ?? "";

    if (/^\s*[-*•]\s*$/.test(line)) {
      const j = nextNonEmpty(rawLines, i + 1);
      if (
        j !== -1 &&
        !isHeadingLine(rawLines[j] ?? "") &&
        !startsWithListMarker(rawLines[j] ?? "")
      ) {
        lines.push(`- ${rawLines[j]!.trim()}`);
        i = j;
        continue;
      }
      continue;
    }

    if (/^\s*\d+\.\s*$/.test(line)) {
      const j = nextNonEmpty(rawLines, i + 1);
      if (j !== -1 && !isHeadingLine(rawLines[j] ?? "")) {
        lines.push(`${line.trim()} ${rawLines[j]!.trim()}`);
        i = j;
        continue;
      }
    }

    const midHeading = line.match(/^(.*?)(\s{0,2}#{1,4}\s+\S.*)$/);
    if (midHeading?.[1]?.trim() && midHeading[2] && !line.trim().startsWith("#")) {
      lines.push(midHeading[1].trim());
      lines.push(midHeading[2].trim());
      continue;
    }

    lines.push(line);
  }

  return lines.join("\n");
}

function unwrapLeftoverLink(
  label: string,
  href: string,
  trailing: string,
): string {
  const joined = `${label}${trailing}`;
  if (LEFTOVER_UNWRAP_HREFS.test(href.trim())) {
    return joined;
  }
  if (/^https?:\/\/[^/]*squarespace/i.test(href)) {
    return joined;
  }
  let nextHref = href.trim();
  if (/^\/certificates-of-analysis\/?$/i.test(nextHref)) {
    nextHref = "/certificates";
  }
  const shopLegacy = nextHref.match(/^\/shop-peptides\/p\/([^/?#]+)/i);
  if (shopLegacy?.[1]) {
    nextHref = `/shop/${shopLegacy[1]}`;
  }
  return `[${label}](${nextHref})${trailing}`;
}

function normalizeInline(md: string): string {
  const lines = md.split("\n").map((line) => {
    let s = line.replace(/^[ \t]+/, "").replace(/[ \t]+$/, "");
    s = s.replace(/\u00a0/g, " ");

    const heading = s.match(/^(#{1,6})\s*(.*)$/);
    if (heading) {
      let title = (heading[2] ?? "")
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)([A-Za-z]*)/g,
          (_, label: string, href: string, trailing: string) =>
            unwrapLeftoverLink(label, href, trailing),
        )
        .replace(/^\s*\*\*(.+?)\*\*\s*$/, "$1")
        .replace(/^\[(?:\*\*)?(.+?)(?:\*\*)?\]\(([^)]+)\)\s*$/, "$1")
        .replace(/\s+/g, " ")
        .trim();
      if (!title) return "";
      if (/:$/.test(title) && title.length < 48) {
        return `**${title}**`;
      }
      return `${heading[1]} ${title}`;
    }

    if (/^[✅☑️✔]\s+\S/.test(s)) {
      s = `- ${s.replace(/^[✅☑️✔]\s+/, "")}`;
    }

    const boldOnly = s.match(/^\*\*(.+?)\*\*\s*$/);
    if (
      boldOnly?.[1] &&
      boldOnly[1].length < 90 &&
      !/[.]{2,}/.test(boldOnly[1]) &&
      !/:$/.test(boldOnly[1].trim())
    ) {
      const title = boldOnly[1].trim();
      if (title && !/^[-*•]/.test(title)) {
        return `### ${title}`;
      }
    }

    s = s.replace(
      /\[([^\]]+)\]\(([^)]+)\)([A-Za-z]*)/g,
      (_, label: string, href: string, trailing: string) =>
        unwrapLeftoverLink(label, href, trailing),
    );

    return s.replace(/[ \t]{2,}/g, " ");
  });

  return lines.join("\n");
}

function tightenSpacing(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const prev = out[out.length - 1];
    const next = peekNextNonEmpty(lines, i + 1);

    if (!line.trim()) {
      if (!prev) continue;
      if (isListLine(prev) && isListLine(next)) continue;
      if (isHeadingLine(prev)) continue;
      if (out[out.length - 1] === "") continue;
      out.push("");
      continue;
    }

    out.push(line);
  }

  while (out.length && !out[out.length - 1]?.trim()) out.pop();
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function peekNextNonEmpty(lines: string[], from: number): string {
  const i = nextNonEmpty(lines, from);
  return i === -1 ? "" : (lines[i] ?? "");
}

function normalizeProductHtml(html: string): string {
  return html
    .replace(/<p>\s*(?:[-*•]|<br\s*\/?>)?\s*<\/p>\s*(<p>)/gi, "$1")
    .replace(/<li>\s*(?:<p>\s*<\/p>)?\s*<\/li>\s*<li>/gi, "<li>")
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
