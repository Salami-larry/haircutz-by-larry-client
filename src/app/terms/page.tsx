"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function TermsPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-hbl-bg text-hbl-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="prose-hbl"
        >
          <h1 className="font-display text-4xl font-semibold tracking-wide">Terms</h1>
          <p className="mt-2 text-sm text-hbl-muted">Haircutz by Larry · Lagos</p>

          <section className="mt-10 space-y-4 text-sm leading-relaxed text-hbl-ink sm:text-base">
            <h2 className="font-display text-2xl font-semibold">Bookings & payment</h2>
            <p>
              Selecting a slot creates a short unpaid hold. Your appointment is confirmed only
              after successful payment. Unpaid holds may be released automatically after about
              15 minutes.
            </p>

            <h2 className="font-display text-2xl font-semibold pt-4">Non-refundable</h2>
            <p>
              All payments for appointments are <strong>non-refundable</strong>. Please check
              the style, service type (walk-in or home), date, and time carefully before you
              pay.
            </p>

            <h2 className="font-display text-2xl font-semibold pt-4">Missed appointments</h2>
            <p>
              If an appointment is marked <strong>missed</strong>, you may reschedule once for
              free using your tracking number and email on the track page — no extra Paystack
              charge. Rescheduling is not available for paid or acknowledged bookings that are
              still upcoming.
            </p>

            <h2 className="font-display text-2xl font-semibold pt-4">Home service</h2>
            <p>
              Home service is available in Lagos only, Monday–Saturday within published hours.
              Provide a clear address or area when booking. Sunday home service is not offered.
            </p>

            <h2 className="font-display text-2xl font-semibold pt-4">Shop hours</h2>
            <p>
              Walk-in: Mon–Sat 09:00–22:00, Sun 12:00–22:00 (Africa/Lagos). Home service:
              Mon–Sat 10:00–17:00. Availability depends on open slots for the selected style
              duration.
            </p>

            <h2 className="font-display text-2xl font-semibold pt-4">Conduct</h2>
            <p>
              We reserve the right to refuse or end service where safety, respect, or shop
              policies are not observed. Contact us if you need help with a booking.
            </p>
          </section>

          <p className="mt-10 text-sm text-hbl-muted">
            <Link href="/contact" className="underline">
              Contact
            </Link>
            {" · "}
            <Link href="/" className="underline">
              Styles
            </Link>
          </p>
        </motion.article>
      </main>
      <SiteFooter />
    </div>
  );
}
