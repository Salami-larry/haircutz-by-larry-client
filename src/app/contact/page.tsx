"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  EnvironmentOutlined,
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { contact, contactLinks } from "@/lib/contact";

type ContactRowProps = {
  icon: ReactNode;
  label: string;
  href: string;
  children: ReactNode;
  external?: boolean;
};

function ContactRow({ icon, label, href, children, external }: ContactRowProps) {
  return (
    <div className="flex gap-4 border-b border-black/10 py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center bg-hbl-primary text-white"
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-hbl-muted">{label}</p>
        <a
          href={href}
          className="mt-1 block text-base font-medium text-hbl-ink underline-offset-2 hover:underline"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-hbl-bg text-hbl-ink">
      <SiteHeader active="contact" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-4xl font-semibold tracking-wide">Contact</h1>
          <p className="mt-2 text-sm text-hbl-muted">
            Questions about bookings, styles, or home service in Lagos.
          </p>

          <div className="mt-8 bg-white py-2">
            <ContactRow
              icon={<MailOutlined style={{ fontSize: 18 }} />}
              label="Email"
              href={contactLinks.mailto}
            >
              {contact.email}
            </ContactRow>
            <ContactRow
              icon={<PhoneOutlined style={{ fontSize: 18 }} />}
              label="Phone"
              href={contactLinks.tel}
            >
              {contact.phoneDisplay}
            </ContactRow>
            <ContactRow
              icon={<WhatsAppOutlined style={{ fontSize: 18 }} />}
              label="WhatsApp"
              href={contactLinks.whatsapp}
              external
            >
              Chat on WhatsApp
            </ContactRow>
            <ContactRow
              icon={<InstagramOutlined style={{ fontSize: 18 }} />}
              label="Instagram"
              href={contactLinks.instagram}
              external
            >
              @{contact.instagramHandle}
            </ContactRow>
            <ContactRow
              icon={<EnvironmentOutlined style={{ fontSize: 18 }} />}
              label="Location"
              href={contactLinks.maps}
              external
            >
              {contact.address}
            </ContactRow>
          </div>

          <p className="mt-8 text-center text-sm text-hbl-muted">
            <Link href="/" className="underline">
              Back to styles
            </Link>
          </p>
        </motion.div>
      </main>
      <SiteFooter />
    </div>
  );
}
