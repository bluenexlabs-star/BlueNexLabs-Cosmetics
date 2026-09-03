"use client";

import { Button } from "@/components/ui/button";
import { primaryCoaHref } from "@/lib/certificates";

export function CoaButton({
  slug,
  variantLabel,
  className,
}: {
  slug: string;
  variantLabel?: string;
  className?: string;
}) {
  const href = primaryCoaHref(slug, variantLabel);
  if (!href) return null;

  return (
    <Button asChild variant="light" className={className}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        Certificate of Analysis
      </a>
    </Button>
  );
}
