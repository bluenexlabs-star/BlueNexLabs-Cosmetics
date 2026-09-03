import { isPostgresUrl } from "@/lib/env";

export function containsCI(value: string) {
  const query = value.trim();
  if (isPostgresUrl()) {
    return { contains: query, mode: "insensitive" as const };
  }
  return { contains: query };
}

export function productSearchWhere(q: string) {
  const query = q.trim();
  if (!query) return {};
  const match = containsCI(query);
  return {
    OR: [
      { name: match },
      { slug: match },
      { description: match },
    ],
  };
}

export function postSearchWhere(q: string) {
  const query = q.trim();
  if (!query) return {};
  const match = containsCI(query);
  return {
    OR: [
      { title: match },
      { excerpt: match },
      { category: match },
      { slug: match },
    ],
  };
}
