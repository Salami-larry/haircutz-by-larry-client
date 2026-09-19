import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-black/10 bg-hbl-primary text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <BrandMark size="md" className="text-white" />
        <nav className="flex flex-wrap gap-4 text-sm text-white/80">
          <Link href="/" className="hover:text-white">
            Styles
          </Link>
          <Link href="/track" className="hover:text-white">
            Track
          </Link>
          <Link href="/contact" className="hover:text-white">
            Contact
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/50 sm:px-6">
        © {new Date().getFullYear()} Haircutz by Larry · Lagos
      </div>
    </footer>
  );
}
