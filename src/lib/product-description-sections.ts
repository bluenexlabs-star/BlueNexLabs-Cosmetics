export type ProductDescriptionSection = {
  headingTag: "h2" | "h3" | "h4";
  headingHtml: string;
  bodyHtml: string;
};

export type SplitProductDescription = {
  preambleHtml: string;
  sections: ProductDescriptionSection[];
};

type HeadingMatch = {
  level: 2 | 3 | 4;
  full: string;
  inner: string;
  index: number;
};

function collectHeadings(html: string): HeadingMatch[] {
  const re = /<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  const matches: HeadingMatch[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const level = Number(match[1]) as 2 | 3 | 4;
    matches.push({
      level,
      full: match[0],
      inner: match[2] ?? "",
      index: match.index,
    });
  }
  return matches;
}

function splitLevelsFor(headings: HeadingMatch[]): Set<2 | 3 | 4> {
  const levels = new Set(headings.map((heading) => heading.level));
  if (levels.has(2) || levels.has(3)) return new Set([2, 3]);
  if (levels.has(4)) return new Set([4]);
  return new Set();
}

function isBlankHtml(html: string): boolean {
  return !html.replace(/<p>\s*<\/p>/gi, "").replace(/\s+/g, "").trim();
}

function mergeEmptyLeadingSections(
  sections: ProductDescriptionSection[],
): ProductDescriptionSection[] {
  const merged: ProductDescriptionSection[] = [];

  for (const section of sections) {
    const prev = merged[merged.length - 1];
    if (prev && isBlankHtml(prev.bodyHtml)) {
      prev.bodyHtml =
        `<${section.headingTag}>${section.headingHtml}</${section.headingTag}>` +
        section.bodyHtml;
      continue;
    }
    merged.push({ ...section });
  }

  return merged.filter((section) => !isBlankHtml(section.headingHtml));
}

/**
 * Splits rendered product HTML into accordion sections.
 *
 * Section breaks are h2/h3 when those exist (the icon headings on most SKUs).
 * If a product only uses h4 as its top-level headings, those become sections.
 * Nested deeper headings stay inside the current item. Consecutive headings
 * with no body in between are merged so we never emit an empty accordion row.
 */
export function splitProductDescriptionHtml(
  html: string,
): SplitProductDescription {
  const trimmed = html.trim();
  if (!trimmed) return { preambleHtml: "", sections: [] };

  const headings = collectHeadings(trimmed);
  const splitLevels = splitLevelsFor(headings);
  const breaks = headings.filter((heading) => splitLevels.has(heading.level));

  if (breaks.length < 2) {
    return { preambleHtml: trimmed, sections: [] };
  }

  const raw: ProductDescriptionSection[] = [];
  for (let i = 0; i < breaks.length; i++) {
    const current = breaks[i]!;
    const start = current.index + current.full.length;
    const end = i + 1 < breaks.length ? breaks[i + 1]!.index : trimmed.length;
    raw.push({
      headingTag: `h${current.level}` as ProductDescriptionSection["headingTag"],
      headingHtml: current.inner,
      bodyHtml: trimmed.slice(start, end).trim(),
    });
  }

  const sections = mergeEmptyLeadingSections(raw);
  if (sections.length < 2) {
    return { preambleHtml: trimmed, sections: [] };
  }

  return {
    preambleHtml: trimmed.slice(0, breaks[0]!.index).trim(),
    sections,
  };
}
