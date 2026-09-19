"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Result, Spin } from "antd";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { verifyPayment } from "@/lib/api";

const PAID = new Set(["paid", "acknowledged", "completed"]);

function BookSuccessInner() {
  const params = useSearchParams();
  const reference = params.get("reference") ?? "";

  const [status, setStatus] = useState<string | null>(null);
  const [tracking, setTracking] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(reference));
  const [failed, setFailed] = useState(false);
  const stopRef = useRef(false);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }

    stopRef.current = false;
    let cancelled = false;

    async function poll() {
      if (stopRef.current) return;
      try {
        const v = await verifyPayment(reference);
        if (cancelled || stopRef.current) return;
        setStatus(v.status);
        if (v.trackingNumber) setTracking(v.trackingNumber);
        if (PAID.has(v.status)) {
          stopRef.current = true;
          setLoading(false);
          return;
        }
        setLoading(v.paystackStatus === "success");
      } catch {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
          stopRef.current = true;
        }
      }
    }

    void poll();
    const id = window.setInterval(() => void poll(), 4000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [reference]);

  if (!reference) {
    return (
      <Result
        status="error"
        title="Missing payment reference"
        subTitle="Return from Paystack checkout, or book again from the catalogue."
        extra={
          <Link href="/">
            <Button type="primary">View styles</Button>
          </Link>
        }
      />
    );
  }

  if (failed) {
    return (
      <Result
        status="error"
        title="Could not confirm payment"
        subTitle="Check your connection or try the link from your payment receipt again."
        extra={
          <Button type="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        }
      />
    );
  }

  const paid = status != null && PAID.has(status);
  const unpaid = status === "booked" || status === "abandoned";

  if (loading && status === null) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <Spin size="large" />
        <p className="text-hbl-muted">Checking payment…</p>
      </div>
    );
  }

  if (loading && !paid) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <Spin size="large" />
        <p className="text-hbl-muted">Confirming payment…</p>
      </div>
    );
  }

  return (
    <Result
      status={paid ? "success" : unpaid ? "info" : "warning"}
      title={
        paid
          ? "Payment received"
          : unpaid
            ? "Payment not completed"
            : "Payment pending confirmation"
      }
      subTitle={
        paid
          ? tracking
            ? `Your tracking number: ${tracking}. We also emailed your confirmation.`
            : "We will email your tracking number shortly."
          : "If you closed Paystack early, you can book again from the catalogue. Admins can also mark a hold as paid."
      }
      extra={
        <div className="flex flex-wrap justify-center gap-3">
          {paid && tracking ? (
            <Link href={`/track?tracking=${encodeURIComponent(tracking)}`}>
              <Button type="primary" size="large">
                Track appointment
              </Button>
            </Link>
          ) : null}
          <Link href="/">
            <Button type={paid && tracking ? "default" : "primary"} size="large">
              View styles
            </Button>
          </Link>
        </div>
      }
    />
  );
}

export default function BookSuccessPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-hbl-bg text-hbl-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 sm:px-6">
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          }
        >
          <BookSuccessInner />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
