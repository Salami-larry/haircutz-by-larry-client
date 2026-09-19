"use client";

import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { brand } from "@/lib/brand";

type Props = {
  active?: "home" | "track" | "contact" | "terms";
};

export function SiteHeader({ active }: Props) {
  const navLinkClass = (key: typeof active) => {
    const isActive = key === active;
    const base =
      "site-header-interactive site-header-link inline-flex items-center rounded-md px-3 py-1.5 text-sm no-underline transition-colors";
    return `${base}${isActive ? " bg-white/15" : ""}`;
  };

  return (
    <header
      data-site-header
      className="sticky top-0 z-50 border-b border-white/10"
      style={
        {
          ["--site-header-fg" as string]: "#ffffff",
          ["--site-header-hover-bg" as string]: "rgba(255, 255, 255, 0.1)",
          backgroundColor: brand.primary,
          color: "#ffffff",
        } as React.CSSProperties
      }
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <Link href="/" className="site-header-logo no-underline">
          <BrandMark size="sm" />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/#styles" className={navLinkClass("home")}>
            Styles
          </Link>
          <Link href="/track" className={navLinkClass("track")}>
            Track
          </Link>
          <Link href="/contact" className={navLinkClass("contact")}>
            Contact
          </Link>
          <Link href="/terms" className={`${navLinkClass("terms")} hidden sm:inline-flex`}>
            Terms
          </Link>
        </nav>
      </div>
    </header>
  );
}
