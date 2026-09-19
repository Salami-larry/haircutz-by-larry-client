"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Alert, Spin } from "antd";
import { motion } from "framer-motion";

import { BookStylePanel } from "@/components/book-style-panel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ApiError, getHairstyle, type Hairstyle } from "@/lib/api";
import { formatDuration, formatKobo } from "@/lib/format";

export default function StyleDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [style, setStyle] = useState<Hairstyle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getHairstyle(id);
      setStyle(data);
      setActiveImage(0);
      setError(null);
    } catch (e) {
      setStyle(null);
      setError(e instanceof ApiError ? e.message : "Style not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-hbl-bg text-hbl-ink">
      <SiteHeader active="home" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Link href="/#styles" className="text-sm text-hbl-muted underline">
          ← All styles
        </Link>

        {loading ? (
          <div className="flex justify-center py-24">
            <Spin size="large" />
          </div>
        ) : null}
        {error ? (
          <Alert type="error" message={error} showIcon className="mt-8" />
        ) : null}

        {style ? (
          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              style={{ willChange: "opacity, transform" }}
            >
              <div className="overflow-hidden bg-hbl-primary">
                {style.imageUrls[activeImage] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={style.imageUrls[activeImage]}
                    alt={style.name}
                    className="aspect-4/5 w-full object-cover"
                  />
                ) : (
                  <div className="aspect-4/5 bg-neutral-900" />
                )}
              </div>
              {style.imageUrls.length > 1 ? (
                <div className="mt-3 flex gap-2">
                  {style.imageUrls.map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`overflow-hidden border-2 ${
                        i === activeImage ? "border-hbl-primary" : "border-transparent"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-16 w-16 object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
              {style.videoUrl ? (
                <video
                  controls
                  playsInline
                  className="mt-4 w-full bg-black"
                  src={style.videoUrl}
                />
              ) : null}
            </motion.div>

            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
              >
                <h1 className="font-display text-4xl font-semibold tracking-wide sm:text-5xl">
                  {style.name}
                </h1>
                <p className="mt-4 text-base text-hbl-muted sm:text-lg">{style.description}</p>
                <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-hbl-muted">Walk-in</dt>
                    <dd className="text-lg font-medium">{formatKobo(style.walkInPriceKobo)}</dd>
                  </div>
                  <div>
                    <dt className="text-hbl-muted">Home service</dt>
                    <dd className="text-lg font-medium">
                      {formatKobo(style.homeServicePriceKobo)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-hbl-muted">Duration</dt>
                    <dd className="text-lg font-medium">
                      {formatDuration(style.durationMinutes)}
                    </dd>
                  </div>
                </dl>
              </motion.div>

              <div className="mt-10">
                <BookStylePanel style={style} />
              </div>
            </div>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
