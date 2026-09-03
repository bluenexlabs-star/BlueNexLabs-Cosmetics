/**
 * Conservative article-body formatter.
 *
 * Migrated Squarespace posts often arrive as one line (newlines stripped) plus
 * leftover `#block-…` CSS. This module reconstructs TipTap-friendly HTML
 * without inventing claims — it only inserts structure already implied by the text.
 *
 * Heuristics (applied in order):
 *  1. Drop Squarespace `#block-` CSS, zero-width chars, and empty wrappers.
 *  2. If the body already has real block tags (several `<p>` / headings / lists)
 *     and is not a single giant `<p>`, return it with light cleanup.
 *  3. If it looks like markdown with real line breaks, convert line-by-line
 *     (join `-⏎item` / `-⏎⏎item` list splits from the CMS export; treat
 *     bold-only lines as headings).
 *  4. Otherwise treat it as flattened prose:
 *     - normalize `·` / `•` runs into `<ul>`
 *     - promote `1. Title`, `Step N:`, `Indicator #N:` to `<h3>`
 *     - promote Title-Case phrases and short FAQ questions to `<h2>`
 *     - after “include:” / “identifies:” etc., treat following name-like
 *       tokens as list items until a real sentence resumes
 *     - remaining sentences become `<p>` (grouped, not one-sentence crumbs)
 *
 * Safe to run more than once: structured HTML is left alone.
 */

const SMALL_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "by",
  "for",
  "from",
  "in",
  "into",
  "of",
  "on",
  "or",
  "the",
  "to",
  "vs",
  "vs.",
  "with",
  "&",
]);

const NAMED_HEADINGS =
  /^(Introduction|Conclusion|Disclaimer|Summary|Overview|Background|References|Related Reading|Product Overview|Frequently Asked Questions|Important compliance note|Research-use-only disclaimer|Important context|Research-use notice|Key principle)$/i;

const NAMED_LEAD =
  /^(Key principle|Important context|Research-use notice|Disclaimer|Important compliance note):\s+(.+)$/i;

const COLON_LIST_LEAD =
  /(?:include(?:s|d)?|including|following|identifies?|contain(?:s|ing)?|confirm(?:s|ing)?|verify|covers?|features?|involve(?:s|d)?|studying|regarding|into|of|such as|as follows|are)\s*:$/i;

export function looksFlattened(input: string): boolean {
  const text = stripSquarespaceJunk(input).trim();
  if (!text) return false;
  if (hasStructuredHtml(text) && !isSingleBlobHtml(text)) return false;
  if (looksLikeMarkdown(text)) return false;
  const plain = stripTags(text);
  const lines = plain.split(/\n/).filter((l) => l.trim());
  const maxLine = Math.max(0, ...lines.map((l) => l.length));
  return maxLine > 900 || (lines.length <= 3 && plain.length > 400);
}

export function cleanupArticleHtml(input: string): string {
  const raw = stripSquarespaceJunk(input).trim();
  if (!raw) return "";

  if (hasStructuredHtml(raw) && !isSingleBlobHtml(raw)) {
    return normalizeStructuredHtml(raw);
  }

  if (looksLikeMarkdown(raw)) {
    return markdownToStructuredHtml(raw);
  }

  return reconstructFlattened(htmlToPlain(raw));
}

function stripSquarespaceJunk(input: string): string {
  return input
    .replace(/\u200b|\u200c|\u200d|\ufeff/g, "")
    .replace(/\n\s*#block-[\s\S]*$/g, "")
    .replace(/\\n#block-[\s\S]*$/g, "")
    .replace(/\s*#block-[a-z0-9]+[\s\S]*$/gi, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

function hasStructuredHtml(input: string): boolean {
  if (!/^\s*</.test(input)) return false;
  return (input.match(/<(p|h[1-6]|ul|ol|li|blockquote)\b/gi) || []).length >= 3;
}

function isSingleBlobHtml(input: string): boolean {
  const headings = (input.match(/<h[1-6]\b/gi) || []).length;
  const lists = (input.match(/<[uo]l\b/gi) || []).length;
  const paragraphs = (input.match(/<p\b/gi) || []).length;
  if (headings + lists > 0) return false;
  if (paragraphs > 2) return false;
  const text = stripTags(input);
  return text.length > 400 && (text.match(/\n/g) || []).length < 3;
}

function looksLikeMarkdown(input: string): boolean {
  if (/^\s*</.test(input)) return false;
  const lines = input.split("\n").filter((l) => l.trim());
  if (lines.length < 6) return false;
  const maxLine = Math.max(0, ...lines.map((l) => l.length));
  if (maxLine > 1200) return false;
  const headingLines = lines.filter((l) => /^#{1,6}\s+\S/.test(l.trim())).length;
  const shortLines = lines.filter((l) => l.length < 220).length;
  return headingLines >= 1 || shortLines / lines.length > 0.55;
}

function normalizeStructuredHtml(html: string): string {
  return html.replace(/<p>\s*<\/p>/gi, "").replace(/\n{3,}/g, "\n\n").trim();
}

function htmlToPlain(input: string): string {
  return stripTags(
    input
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|h[1-6]|div|blockquote|li)>/gi, "\n")
      .replace(/<li\b[^>]*>/gi, " · "),
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escAttr(text: string): string {
  return esc(text).replace(/"/g, "&quot;");
}

function formatInline(text: string): string {
  const held: string[] = [];
  const hold = (html: string) => {
    held.push(html);
    return `\u0000${held.length - 1}\u0000`;
  };

  let s = text.replace(/\s+/g, " ").trim();
  s = s.replace(/\[\[([^\]]+)\]\]\(([^)]+)\)/g, (_, label: string, href: string) =>
    hold(`<a href="${escAttr(href)}">${esc(label)}</a>`),
  );
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, href: string) =>
    hold(`<a href="${escAttr(href)}">${esc(label)}</a>`),
  );
  s = s.replace(/\*\*([^*]+)\*\*/g, (_, inner: string) =>
    hold(`<strong>${esc(inner)}</strong>`),
  );
  s = s.replace(
    /(^|[\s(])_([^_\n]{1,200})_/g,
    (_, pre: string, inner: string) => pre + hold(`<em>${esc(inner)}</em>`),
  );
  s = s.replace(/https?:\/\/[^\s)<]+/g, (url) =>
    hold(`<a href="${escAttr(url)}">${esc(url)}</a>`),
  );
  return esc(s).replace(/\u0000(\d+)\u0000/g, (_, i) => held[Number(i)] ?? "");
}

function p(text: string): string {
  const inner = formatInline(text);
  return inner ? `<p>${inner}</p>` : "";
}

function h(level: 2 | 3, text: string): string {
  const inner = formatInline(text.replace(/^#{1,6}\s+/, "").trim());
  return inner ? `<h${level}>${inner}</h${level}>` : "";
}

function list(items: string[], ordered = false): string {
  const lis = items
    .map((item) => item.replace(/^[·•]\s*/, "").trim())
    .filter(Boolean)
    .map((item) => `<li><p>${formatInline(item)}</p></li>`);
  if (!lis.length) return "";
  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${lis.join("")}</${tag}>`;
}

function nextNonEmpty(lines: string[], from: number): number {
  for (let i = from; i < lines.length; i++) {
    if (lines[i]?.trim()) return i;
  }
  return -1;
}

function markdownToStructuredHtml(md: string): string {
  const rawLines = md.replace(/\r\n/g, "\n").split("\n");
  const lines: string[] = [];
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i] ?? "";
    if (/^\s*[-*•]\s*$/.test(line)) {
      const j = nextNonEmpty(rawLines, i + 1);
      if (
        j !== -1 &&
        !/^#{1,6}\s/.test(rawLines[j] ?? "") &&
        !/^\s*(?:[-•]|\*(?!\*))/.test(rawLines[j] ?? "")
      ) {
        lines.push(`- ${rawLines[j]!.trim()}`);
        i = j;
        continue;
      }
    }
    if (/^\s*\d+\.\s*$/.test(line)) {
      const j = nextNonEmpty(rawLines, i + 1);
      if (j !== -1) {
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

  const out: string[] = [];
  let bullets: string[] = [];
  let ordered: string[] = [];
  let para: string[] = [];

  const flushLists = () => {
    if (bullets.length) {
      out.push(list(bullets));
      bullets = [];
    }
    if (ordered.length) {
      out.push(list(ordered, true));
      ordered = [];
    }
  };
  const flushPara = () => {
    if (para.length) {
      out.push(p(para.join(" ")));
      para = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushPara();
      flushLists();
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushPara();
      flushLists();
      out.push(h((heading[1]?.length ?? 2) <= 2 ? 2 : 3, heading[2] ?? ""));
      continue;
    }

    const boldHeading = trimmed.match(/^(?:[^\w#[*]+\s*)?\*\*(.+?)\*\*\s*$/);
    if (boldHeading?.[1] && boldHeading[1].length < 140 && !/[.]{2,}/.test(boldHeading[1])) {
      flushPara();
      flushLists();
      const title = boldHeading[1].trim();
      out.push(h(/^\d+\./.test(title) || title.length < 48 ? 3 : 2, title));
      continue;
    }

    const bullet = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bullet) {
      flushPara();
      if (ordered.length) flushLists();
      bullets.push(bullet[1] ?? "");
      continue;
    }

    const num = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (num && trimmed.length < 200 && !/[.]{2,}/.test(trimmed)) {
      flushPara();
      if (bullets.length) flushLists();
      ordered.push(num[2] ?? "");
      continue;
    }

    flushLists();
    para.push(trimmed);
  }
  flushPara();
  flushLists();
  return out.filter(Boolean).join("\n");
}

type Block =
  | { type: "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

function reconstructFlattened(text: string): string {
  let prepared = text
    .replace(/\s+/g, " ")
    .replace(/\s+([,;:.!?])/g, "$1")
    .replace(/\s*[·•⋅∙]\s*/g, " · ")
    .trim();
  if (!prepared) return "";

  const lists: string[][] = [];
  prepared = extractMiddotLists(prepared, lists);
  prepared = prepared.replace(/\s·\s/g, "\n");

  const blocks: Block[] = [];
  const chunks = prepared
    .replace(/%%UL(\d+)%%/g, "\n%%UL$1%%\n")
    .split(/\n+/)
    .map((c) => c.trim())
    .filter(Boolean);
  for (const chunk of chunks) {
    const listRef = chunk.match(/^%%UL(\d+)%%$/);
    if (listRef) {
      const items = lists[Number(listRef[1])] ?? [];
      if (items.length) blocks.push({ type: "ul", items });
      continue;
    }
    blocks.push(...classifyProse(chunk));
  }
  return renderBlocks(coalesceBlocks(blocks));
}

function extractMiddotLists(text: string, lists: string[][]): string {
  return text.replace(
    /(?:^|(?<=[\.!?]\s)|(?<=:\s))((?:·\s)?(?:[^·\n]{1,90}\s·\s){1,}[^·\n]{1,400})/g,
    (match) => {
      const raw = match.replace(/^·\s/, "").trim();
      const parts = raw.split(/\s·\s/).map((part) => part.trim()).filter(Boolean);
      if (parts.length < 2) return match;

      let prefix = "";
      const first = parts[0] ?? "";
      if (first.length > 70) {
        const words = first.split(/\s+/);
        let take = 1;
        for (let t = 1; t <= Math.min(6, words.length); t++) {
          const tail = words.slice(-t).join(" ");
          if (isShortLabel(tail) || isTitleCasePhrase(tail)) take = t;
        }
        prefix = words.slice(0, -take).join(" ");
        parts[0] = words.slice(-take).join(" ");
      } else if (NAMED_HEADINGS.test(first) || isTitleCasePhrase(first)) {
        prefix = first;
        parts.shift();
      }

      const last = parts[parts.length - 1] ?? "";
      const split = splitGluedTail(last);
      let suffix = "";
      if (split) {
        parts[parts.length - 1] = split.item;
        suffix = split.rest;
      }

      const items = parts.filter(Boolean);
      if (items.length < 2) return match;
      const id = lists.length;
      lists.push(items);
      const lead = prefix ? `${prefix}\n` : "";
      const trail = suffix ? `\n${suffix}` : "";
      return `\n${lead}%%UL${id}%%${trail}\n`;
    },
  );
}

function isShortLabel(text: string): boolean {
  const words = text.trim().split(/\s+/);
  return words.length <= 6 && text.length <= 70 && /^[A-Z0-9]/.test(text);
}

function isTitleCasePhrase(text: string): boolean {
  const clean = text.replace(/[:?]+$/, "").trim();
  if (!clean) return false;
  const words = clean.split(/\s+/);
  if (words.length < 2 || words.length > 12) return NAMED_HEADINGS.test(clean);
  if (NAMED_HEADINGS.test(clean)) return true;
  const main = words.filter((w) => !SMALL_WORDS.has(w.toLowerCase().replace(/[:?,]/g, "")));
  if (/^(What|Why|How|When|Where|Who|Are|Is|Can|Should|Does|Do|Which)\b/.test(clean)) {
    if (/\?$/.test(text)) return words.length <= 14;
    return words.length <= 12 && !main.some((w) => /^[a-z]/.test(w));
  }
  if (main.length < 2) return false;
  const titled = main.filter((w) => /^[A-Z0-9]/.test(w));
  if (titled.length / main.length < 0.85) return false;
  if (main.some((w) => /^[a-z]/.test(w))) return false;
  return true;
}

function splitGluedTail(last: string): { item: string; rest: string } | null {
  const question = last.match(
    /^(.{2,80}?)\s+((?:What|Why|How|When|Where|Who|Are|Is|Can|Should|Does|Do|Which)\b[^?]{0,100}\?\s+[A-Z].+)$/,
  );
  if (question?.[1] && isShortLabel(question[1])) {
    return { item: question[1], rest: question[2] ?? "" };
  }

  const words = last.split(/\s+/);
  if (words.length < 4) return null;

  for (let take = Math.min(8, words.length - 2); take >= 2; take--) {
    const item = words.slice(0, take).join(" ");
    const rest = words.slice(take).join(" ");
    if (item.length > 80) continue;
    if (isSentenceStart(rest) && (isShortLabel(item) || isTitleCasePhrase(item))) {
      return { item, rest };
    }
  }
  return null;
}

function isSentenceStart(text: string): boolean {
  return /^(When|While|Although|Because|If|After|Before|During|Unfortunately|However|Therefore|Meanwhile|Researchers|Scientists|This|These|Those|There|They|It|We|Our|A|An|The|For|In|At|On|As|One|Many|Some|Each|Every|No|Not|Like|Unlike|Without|With|Using|Having|Once|Even|Rather|Instead|Also|Additionally|Importantly|Typically|Generally|Commonly|Often|Sometimes|Usually|Today|Over|Under|Across|Among|Within|Beyond|Despite|Unless|Until|Since|Whether|Both|All|Most|Few|Several|Various|Certain|Other|Another|Such|That|So|Yet|Still|Then|Next|Finally|Overall|Together|BlueNexLabs|Peptides|A |An )\b/.test(
    text,
  );
}

function classifyProse(text: string): Block[] {
  const blocks: Block[] = [];
  const sentences = splitSentences(text);
  let para: string[] = [];
  let paraChars = 0;

  const flushPara = () => {
    if (!para.length) return;
    blocks.push({ type: "p", text: para.join(" ") });
    para = [];
    paraChars = 0;
  };

  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!sentence) continue;

    const numbered = sentence.match(
      /^((?:\d{1,2}\.\s+|Step\s+\d+:\s+|Indicator\s+#?\d+:\s+)[A-Z][A-Za-z0-9/'’()\-]*(?:\s+[A-Z][A-Za-z0-9/'’()\-]*){0,10})\s+([A-Z][a-z].+)$/,
    );
    const numberedTitle = numbered?.[1]?.replace(
      /^\d+\.\s+|^Step\s+\d+:\s+|^Indicator\s+#?\d+:\s+/,
      "",
    );
    const numberedOk =
      numbered &&
      numberedTitle &&
      (isTitleCasePhrase(numberedTitle) || numbered[1]!.split(/\s+/).length <= 12);
    if (numberedOk) {
      if (looksLikeBodyAfterHeading(numbered[2] ?? "") && isSentenceStart(numbered[2] ?? "")) {
        flushPara();
        blocks.push({ type: "h3", text: numbered[1]!.trim() });
        const colon = tryColonList(numbered[2] ?? "");
        if (colon) {
          if (colon.lead) blocks.push({ type: "p", text: colon.lead });
          blocks.push({ type: "ul", items: colon.items });
          if (colon.rest) para.push(colon.rest);
        } else {
          para.push(numbered[2] ?? "");
          paraChars += numbered[2]?.length ?? 0;
        }
        continue;
      }
    }

    const glued = splitHeadingPrefix(sentence);
    if (glued.heading) {
      flushPara();
      blocks.push({
        type: glued.heading.length < 42 && !NAMED_HEADINGS.test(glued.heading) ? "h3" : "h2",
        text: glued.heading,
      });
    }

    const colon = tryColonList(glued.body);
    if (colon) {
      if (colon.lead) {
        para.push(colon.lead);
        flushPara();
      } else {
        flushPara();
      }
      blocks.push({ type: "ul", items: colon.items });
      if (colon.rest) {
        para.push(colon.rest);
        paraChars += colon.rest.length;
      }
      continue;
    }

    if (
      !glued.heading &&
      isTitleCasePhrase(sentence) &&
      sentence.length < 90 &&
      !/[.]$/.test(sentence)
    ) {
      flushPara();
      blocks.push({ type: sentence.length < 40 ? "h3" : "h2", text: sentence });
      continue;
    }

    if (glued.body) {
      para.push(glued.body);
      paraChars += glued.body.length;
      if (para.length >= 3 || paraChars > 420) flushPara();
    }
  }
  flushPara();
  return blocks;
}

function splitSentences(text: string): string[] {
  return text.split(/(?<=[\.!?])\s+(?=[A-Z“"])/).map((s) => s.trim()).filter(Boolean);
}

function splitHeadingPrefix(sentence: string): { heading?: string; body: string } {
  if (NAMED_HEADINGS.test(sentence.replace(/:$/, "")) && sentence.length < 80) {
    return { heading: sentence.replace(/:$/, ""), body: "" };
  }
  const namedLead = sentence.match(NAMED_LEAD);
  if (namedLead) {
    return { heading: namedLead[1], body: namedLead[2] ?? "" };
  }

  const q = sentence.match(
    /^((?:What|Why|How|When|Where|Who|Are|Is|Can|Should|Does|Do|Which)\b[^?]{0,100}\?)\s+([A-Z].+)$/,
  );
  if (q && !/ask:/i.test(sentence.slice(0, 20))) {
    return { heading: q[1], body: q[2] ?? "" };
  }

  const words = sentence.split(/\s+/);
  for (let take = Math.min(12, words.length - 3); take >= 2; take--) {
    const heading = words.slice(0, take).join(" ");
    const body = words.slice(take).join(" ");
    if (!isTitleCasePhrase(heading)) continue;
    if (!looksLikeBodyAfterHeading(body)) continue;
    if (body.toLowerCase().startsWith(heading.toLowerCase())) continue;
    return { heading, body };
  }
  return { body: sentence };
}

function looksLikeBodyAfterHeading(body: string): boolean {
  if (body.split(/\s+/).length < 3 || !/\b[a-z]/.test(body)) return false;
  if (!/^[A-Z“"]/.test(body)) return false;
  if (/^[A-Z]\s/.test(body) && !/^A [a-z]/.test(body)) return false;
  if (isSentenceStart(body)) return true;
  return /\b(is|are|was|were|has|have|can|may|will|should|provides?|contains?|includes?|helps?|refers?|means?|offers?)\b/.test(
    body,
  );
}

function tryColonList(
  text: string,
): { lead: string; items: string[]; rest: string } | null {
  const colon = text.indexOf(":");
  if (colon < 8 || colon > text.length - 8) return null;
  const lead = text.slice(0, colon + 1).trim();
  const after = text.slice(colon + 1).trim();
  if (!COLON_LIST_LEAD.test(lead) || !after) return null;

  const eqItems = after.match(/[^=]{2,60}?\s=\s[^=]{2,40}?(?=\s+[A-Z0-9][^=]{0,40}\s=|$)/g);
  if (eqItems && eqItems.length >= 2) {
    const used = eqItems.join(" ").length;
    return { lead, items: eqItems.map((i) => i.trim()), rest: after.slice(used).trim() };
  }

  const words = after.split(/\s+/);
  const singles: string[] = [];
  let i = 0;
  while (i < words.length && isNameToken(words[i] ?? "")) {
    singles.push(words[i] ?? "");
    i += 1;
  }
  if (singles.length >= 3) {
    while (i < words.length && !isSentenceStart(words.slice(i).join(" "))) {
      const nextWords: string[] = [];
      nextWords.push(words[i] ?? "");
      i += 1;
      while (
        i < words.length &&
        /^[a-z]/.test(words[i] ?? "") &&
        !isSentenceStart(words.slice(i).join(" "))
      ) {
        nextWords.push(words[i] ?? "");
        i += 1;
        if (nextWords.length > 6) break;
      }
      if (nextWords.length && /^[A-Z]/.test(nextWords[0] ?? "")) {
        singles.push(nextWords.join(" "));
      } else {
        i -= nextWords.length;
        break;
      }
      if (nextWords.length > 6) break;
    }
    if (i === words.length || isSentenceStart(words.slice(i).join(" "))) {
      return { lead, items: singles, rest: words.slice(i).join(" ") };
    }
  }

  const items: string[] = [];
  i = 0;
  let current: string[] = [];
  while (i < words.length) {
    const word = words[i] ?? "";
    if (
      current.length &&
      /^[A-Z]/.test(word) &&
      current.some((w) => /^[a-z]/.test(w)) &&
      !SMALL_WORDS.has(word.toLowerCase())
    ) {
      items.push(current.join(" "));
      current = [word];
      i += 1;
      continue;
    }
    if (current.length >= 2 && isSentenceStart(word) && items.length >= 2) break;
    current.push(word);
    i += 1;
    if (current.length > 12) break;
  }
  if (current.length && items.length) items.push(current.join(" "));
  if (items.length < 2) return null;
  return { lead, items, rest: words.slice(i).join(" ").trim() };
}

function isNameToken(word: string): boolean {
  const w = word.replace(/[.,;:]+$/, "");
  if (!w || SMALL_WORDS.has(w.toLowerCase())) return false;
  return /^[A-Z0-9][A-Za-z0-9/'’+\-]{0,40}$/.test(w);
}

function coalesceBlocks(blocks: Block[]): Block[] {
  const out: Block[] = [];
  for (const block of blocks) {
    const prev = out[out.length - 1];
    if (block.type === "ul" && prev?.type === "ul") {
      prev.items.push(...block.items);
      continue;
    }
    if (block.type === "p" && !block.text.trim()) continue;
    out.push(block);
  }
  return out;
}

function renderBlocks(blocks: Block[]): string {
  return blocks
    .map((block) => {
      if (block.type === "h2") return h(2, block.text);
      if (block.type === "h3") return h(3, block.text);
      if (block.type === "p") return p(block.text);
      if (block.type === "ul") return list(block.items);
      return "";
    })
    .filter(Boolean)
    .join("\n");
}
