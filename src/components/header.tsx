"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { BrandLockup } from "@/components/brand-mark";
import { cartCount, useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/session";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/research", label: "Journal" },
  { href: "/certificates", label: "Quality" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export function Header({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const lines = useCart((s) => s.lines);
  const count = cartCount(lines);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/95 text-white backdrop-blur">
      <div className="bg-cyan-400 text-navy-950 text-xs sm:text-sm font-medium tracking-wide">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-1.5">
          Canada-only shipping · Free over $299 · Interac e-Transfer
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="BlueNex Labs Inc. home">
          <BrandLockup onDark markClassName="h-9 w-9" />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm text-slate-300 hover:text-white",
                pathname.startsWith(l.href) && "text-cyan-300",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="rounded-md bg-cyan-400 px-3 py-1.5 text-sm font-semibold text-navy-950 hover:bg-cyan-300"
            >
              Admin
            </Link>
          )}
          <Link
            href={user ? "/account" : "/login"}
            className="hidden items-center gap-1.5 rounded-md px-2 py-2 text-sm text-slate-300 hover:text-white sm:flex"
          >
            <User className="h-4 w-4" />
            {user ? user.name.split(" ")[0] : "Account"}
          </Link>
          <Link
            href="/cart"
            className="relative rounded-md p-2 hover:bg-white/10"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1 text-[11px] font-bold text-navy-950">
                {count}
              </span>
            )}
          </Link>
          <button
            className="rounded-md p-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-white/10 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-slate-200"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)} className="text-sm">
              Contact
            </Link>
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-cyan-300"
              >
                Admin
              </Link>
            )}
            <Link
              href={user ? "/account" : "/login"}
              onClick={() => setOpen(false)}
              className="text-sm"
            >
              {user ? "My account" : "Sign in"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
