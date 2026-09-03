"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SEARCH_DEBOUNCE_MS = 350;

function shopHref(category?: string, q?: string) {
  const params = new URLSearchParams();
  const trimmed = q?.trim();
  if (trimmed) {
    params.set("q", trimmed);
  } else if (category) {
    params.set("category", category);
  }
  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export function ShopSearchForm({
  category,
  q = "",
}: {
  category?: string;
  q?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(q);

  useEffect(() => {
    setValue(q);
  }, [q]);

  const navigate = (nextQuery: string) => {
    router.replace(shopHref(category, nextQuery), { scroll: false });
  };

  useEffect(() => {
    const trimmed = value.trim();
    const urlTrimmed = q.trim();
    if (trimmed === urlTrimmed) return;

    const timer = window.setTimeout(() => {
      navigate(value);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [value, q, category, router]);

  return (
    <form
      action="/shop"
      method="get"
      className="mt-6 flex flex-col gap-3 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        navigate(value);
      }}
    >
      {category ? <input type="hidden" name="category" value={category} /> : null}
      <div className="relative min-w-0 flex-1">
        <input
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search peptides…"
          aria-label="Search peptides"
          autoComplete="off"
          className="h-10 w-full rounded-md border border-navy-200 bg-white px-3 pr-10 text-sm"
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 hover:text-navy-900"
            onClick={() => {
              setValue("");
              navigate("");
            }}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
      <button
        type="submit"
        className="h-10 rounded-md bg-navy-900 px-4 text-sm font-medium text-white"
      >
        Search
      </button>
    </form>
  );
}
