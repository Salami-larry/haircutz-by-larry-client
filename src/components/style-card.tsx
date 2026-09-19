"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { BrandMark } from "@/components/brand-mark";
import { formatDuration, formatKobo } from "@/lib/format";
import type { Hairstyle } from "@/lib/types";

type Props = {
  style: Hairstyle;
  index?: number;
};

export function StyleCard({ style, index = 0 }: Props) {
  const cover = style.imageUrls[0];
  const fromPrice = Math.min(style.walkInPriceKobo, style.homeServicePriceKobo);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.36), ease: "easeOut" }}
      whileHover={{ y: -4 }}
      style={{ willChange: "transform, opacity" }}
      className="group"
    >
      <Link href={`/styles/${style.id}`} className="block no-underline">
        <div className="overflow-hidden bg-hbl-primary">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={style.name}
              className="aspect-4/5 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex aspect-4/5 items-end p-6 text-white">
              <BrandMark size="sm" className="text-white" />
            </div>
          )}
        </div>
        <div className="pt-4">
          <h2 className="font-display text-2xl font-semibold tracking-wide text-hbl-ink">
            {style.name}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm text-hbl-muted">{style.description}</p>
          <p className="mt-3 text-sm text-hbl-ink">
            From {formatKobo(fromPrice)}
            <span className="text-hbl-muted"> · {formatDuration(style.durationMinutes)}</span>
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
