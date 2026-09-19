"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Input, Spin } from "antd";
import { motion } from "framer-motion";

import { BrandMark } from "@/components/brand-mark";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StyleCard } from "@/components/style-card";
import { ApiError, listHairstyles, type Hairstyle } from "@/lib/api";

const PAGE_SIZE = 12;

export default function HomePage() {
  const [items, setItems] = useState<Hairstyle[]>([]);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFirst = useCallback(async (search: string) => {
    setLoading(true);
    setError(null);
    setPage(1);
    try {
      const data = await listHairstyles({
        q: search || undefined,
        page: 1,
        page_size: PAGE_SIZE,
      });
      setItems(data.items);
      setHasNext(data.metadata.has_next_page);
    } catch (e) {
      setItems([]);
      setHasNext(false);
      setError(e instanceof ApiError ? e.message : "Failed to load styles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFirst(query);
  }, [loadFirst, query]);

  async function loadMore() {
    if (!hasNext || loadingMore || loading) return;
    const next = page + 1;
    setLoadingMore(true);
    try {
      const data = await listHairstyles({
        q: query || undefined,
        page: next,
        page_size: PAGE_SIZE,
      });
      setItems((prev) => [...prev, ...data.items]);
      setPage(next);
      setHasNext(data.metadata.has_next_page);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-hbl-bg text-hbl-ink">
      <SiteHeader active="home" />

      <section className="relative min-h-[70vh] overflow-hidden bg-hbl-primary text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 70% 40%, rgba(255,255,255,0.18), transparent 55%), linear-gradient(160deg, #000 0%, #1a1a1a 55%, #0a0a0a 100%)",
          }}
        />
        <div className="relative mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            style={{ willChange: "opacity, transform" }}
          >
            <BrandMark size="lg" className="text-white" />
            <p className="mt-6 max-w-md text-base text-white/75 sm:text-lg">
              Walk-in and home service cuts in Lagos — pick a style, choose a slot, pay to
              lock it in.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#styles">
                <Button type="default" size="large" className="border-white! bg-white! text-black!">
                  Browse styles
                </Button>
              </a>
              <Link href="/track">
                <Button ghost size="large" className="border-white/40! text-white!">
                  Track booking
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <main id="styles" className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-wide sm:text-4xl">
              Styles
            </h1>
            <p className="mt-1 text-sm text-hbl-muted">Walk-in and home service</p>
          </div>
          <Input.Search
            allowClear
            placeholder="Search styles"
            className="w-full sm:max-w-xs"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onSearch={(value) => setQuery(value.trim())}
            enterButton
          />
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : error ? (
          <div className="space-y-3 py-8">
            <p className="text-red-600">{error}</p>
            <Button onClick={() => void loadFirst(query)}>Try again</Button>
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-hbl-muted">
            {query ? "No styles match that search." : "No styles yet — check back soon."}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((style, i) => (
                <StyleCard key={style.id} style={style} index={i} />
              ))}
            </div>
            {hasNext ? (
              <div className="mt-12 flex justify-center">
                <Button size="large" loading={loadingMore} onClick={() => void loadMore()}>
                  Load more
                </Button>
              </div>
            ) : null}
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
