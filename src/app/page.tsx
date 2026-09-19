"use client";

import { motion } from "framer-motion";

import { BrandMark } from "@/components/brand-mark";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-hbl-bg text-hbl-ink">
      <SiteHeader active="home" />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="rounded-lg bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:p-12"
        >
          <BrandMark size="lg" />
          <p className="mt-6 max-w-md text-base text-hbl-muted sm:text-lg">
            Online booking for walk-in and home service cuts in Lagos. Catalogue
            and scheduling land in the next phases.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
