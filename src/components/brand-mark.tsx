import { cn } from "@/lib/utils";

/**
 * Official mark: hollow upward pentagon, 4 arms, 4 solid nodes.
 * Inline SVG — no raster leftover cube, filters, or drop-shadow.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={cn("h-9 w-9 shrink-0", className)}
      aria-hidden="true"
    >
      <line
        x1="62.3"
        y1="31.8"
        x2="77.7"
        y2="9.0"
        stroke="#2377D1"
        strokeWidth="4.9"
        strokeLinecap="round"
      />
      <line
        x1="58.8"
        y1="60.8"
        x2="62.3"
        y2="86.9"
        stroke="#2377D1"
        strokeWidth="4.9"
        strokeLinecap="round"
      />
      <line
        x1="42.0"
        y1="52.3"
        x2="21.8"
        y2="62.2"
        stroke="#2377D1"
        strokeWidth="4.9"
        strokeLinecap="round"
      />
      <line
        x1="44.2"
        y1="35.9"
        x2="27.8"
        y2="23.0"
        stroke="#2377D1"
        strokeWidth="4.9"
        strokeLinecap="round"
      />
      <polygon
        points="62.3,31.8 71.1,47.1 58.8,60.8 42.0,52.3 44.2,35.9"
        fill="none"
        stroke="#2377D1"
        strokeWidth="4.9"
        strokeLinejoin="round"
      />
      <circle cx="77.7" cy="9.0" r="7.0" fill="#2377D1" />
      <circle cx="62.3" cy="86.9" r="10.2" fill="#2377D1" />
      <circle cx="21.8" cy="62.2" r="7.4" fill="#2377D1" />
      <circle cx="27.8" cy="23.0" r="7.3" fill="#2377D1" />
    </svg>
  );
}

export function BrandWordmark({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className="block leading-none">
      <span
        className={cn(
          "block text-[15px] font-bold leading-[1.15] tracking-tight",
          onDark ? "text-[#F8F8F8]" : "text-[#3E424D]",
        )}
      >
        BlueNex
      </span>
      <span
        className={cn(
          "block text-[15px] font-bold leading-[1.15] tracking-tight",
          onDark ? "text-[#F8F8F8]" : "text-[#3E424D]",
        )}
      >
        Labs Inc.
      </span>
    </span>
  );
}

export function BrandLockup({
  onDark = false,
  className,
  markClassName,
}: {
  onDark?: boolean;
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("inline-flex flex-col items-center", className)}>
      <span className="inline-flex items-center gap-2">
        <BrandMark className={markClassName} />
        <BrandWordmark onDark={onDark} />
      </span>
      <span
        className={cn(
          "mt-1 block text-center text-[10px] font-normal leading-tight",
          onDark ? "text-slate-300" : "text-[#3E424D]",
        )}
      >
        Cosmetics you can trust
      </span>
    </span>
  );
}
