import Link from "next/link";
import { BrandLockup } from "@/components/brand-mark";
import { SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-navy-800 bg-navy-950 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <BrandLockup onDark markClassName="h-8 w-8" />
          <p className="mt-3 text-sm leading-6">
            Korean skincare and cosmetic ingredients fulfilled from {SITE.city}.
            Sold as cosmetics for personal skin care — follow each product label.
          </p>
        </div>
        <div>
          <p className="text-white text-sm font-semibold">Shop</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/shop" className="hover:text-white">
              All products
            </Link>
            <Link href="/cart" className="hover:text-white">
              Cart
            </Link>
            <Link href="/certificates" className="hover:text-white">
              Quality & documentation
            </Link>
          </div>
        </div>
        <div>
          <p className="text-white text-sm font-semibold">Company</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/about" className="hover:text-white">
              About
            </Link>
            <Link href="/research" className="hover:text-white">
              Journal
            </Link>
            <Link href="/faq" className="hover:text-white">
              FAQ
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
        <div>
          <p className="text-white text-sm font-semibold">Contact</p>
          <p className="mt-3 text-sm leading-6">
            {SITE.address}
            <br />
            <a className="underline hover:text-white" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
            <br />
            {SITE.hours}
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {SITE.legal}. Cosmetic products for
        personal skin care.{" "}
        <Link href="/terms" className="underline">
          Terms
        </Link>
      </div>
    </footer>
  );
}
