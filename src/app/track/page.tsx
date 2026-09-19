"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  Spin,
  Tag,
  Timeline,
  Typography,
  message,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { motion } from "framer-motion";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  ApiError,
  getAvailability,
  rescheduleAppointment,
  trackAppointment,
  type TrackResult,
} from "@/lib/api";
import { formatDateTime, formatDuration, formatKobo, formatSlotTime } from "@/lib/format";

function statusColor(status: string): string {
  switch (status) {
    case "paid":
      return "blue";
    case "acknowledged":
      return "cyan";
    case "completed":
      return "success";
    case "missed":
      return "warning";
    case "booked":
      return "processing";
    case "abandoned":
      return "default";
    default:
      return "default";
  }
}

function TrackPageInner() {
  const searchParams = useSearchParams();
  const [form] = Form.useForm<{ trackingNumber: string; email: string }>();
  const [result, setResult] = useState<TrackResult | null>(null);
  const [creds, setCreds] = useState<{ trackingNumber: string; email: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [date, setDate] = useState<Dayjs>(() => dayjs());
  const [slots, setSlots] = useState<string[]>([]);
  const [closed, setClosed] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    const tracking = searchParams.get("tracking");
    if (tracking) {
      form.setFieldsValue({ trackingNumber: tracking });
    }
  }, [form, searchParams]);

  const loadSlots = useCallback(async () => {
    if (!result || !date) return;
    setSlotLoading(true);
    setSelectedSlot(null);
    try {
      const data = await getAvailability({
        date: date.format("YYYY-MM-DD"),
        hairstyleId: result.hairstyle.hairstyleId,
        serviceType: result.serviceType,
      });
      setClosed(data.closed);
      setSlots(data.slots ?? []);
    } catch (e) {
      setSlots([]);
      setClosed(false);
      message.error(e instanceof ApiError ? e.message : "Could not load slots");
    } finally {
      setSlotLoading(false);
    }
  }, [date, result]);

  useEffect(() => {
    if (rescheduleOpen && result?.canReschedule) {
      void loadSlots();
    }
  }, [loadSlots, rescheduleOpen, result?.canReschedule]);

  const slotHint = useMemo(() => {
    if (closed) return "Closed for this service on the selected day.";
    if (!slotLoading && slots.length === 0) return "No open slots — try another day.";
    return null;
  }, [closed, slotLoading, slots.length]);

  async function onTrack(values: { trackingNumber: string; email: string }) {
    setLoading(true);
    setRescheduleOpen(false);
    try {
      const data = await trackAppointment(values);
      setResult(data);
      setCreds(values);
    } catch (e) {
      setResult(null);
      setCreds(null);
      message.error(e instanceof ApiError ? e.message : "Appointment not found");
    } finally {
      setLoading(false);
    }
  }

  async function onReschedule() {
    if (!result || !creds || !selectedSlot) {
      message.warning("Pick a new time slot");
      return;
    }
    setRescheduling(true);
    try {
      await rescheduleAppointment({
        appointmentId: result.id,
        trackingNumber: creds.trackingNumber,
        email: creds.email,
        startAt: selectedSlot,
      });
      message.success("Rescheduled — confirmation emailed. Status is paid again.");
      const refreshed = await trackAppointment(creds);
      setResult(refreshed);
      setRescheduleOpen(false);
      setSelectedSlot(null);
    } catch (e) {
      if (e instanceof ApiError && e.code === "same_timeframe") {
        message.error(e.message);
      } else if (
        e instanceof ApiError &&
        (e.code === "slot_unavailable" || e.code === "invalid_start_time")
      ) {
        message.warning(`${e.message} Refreshing times…`);
        await loadSlots();
      } else {
        message.error(e instanceof Error ? e.message : "Reschedule failed");
      }
    } finally {
      setRescheduling(false);
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-4xl font-semibold tracking-wide">Track</h1>
        <p className="mt-2 text-sm text-hbl-muted">
          Enter your tracking number and the email used when booking.
        </p>

        <Form
          form={form}
          layout="vertical"
          className="mt-8"
          onFinish={(v) => void onTrack(v)}
          requiredMark={false}
        >
          <Form.Item
            name="trackingNumber"
            label="Tracking number"
            rules={[{ required: true, message: "Tracking number is required" }]}
          >
            <Input size="large" placeholder="HBL-YYYYMMDD-XXXXXX" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input size="large" placeholder="you@example.com" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            Track appointment
          </Button>
        </Form>
      </motion.div>

      {result ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 border border-black/10 bg-white p-6"
        >
          <Tag color={statusColor(result.status)}>{result.status}</Tag>
          <p className="mt-3 font-medium">{result.trackingNumber}</p>
          <p className="mt-1 text-sm text-hbl-muted">
            {result.hairstyle.name} ·{" "}
            {result.serviceType === "home_service" ? "Home service" : "Walk-in"} ·{" "}
            {formatDuration(result.hairstyle.durationMinutes)}
          </p>
          <p className="mt-1 text-sm">
            {formatDateTime(result.startAt)} → {formatDateTime(result.endAt)}
          </p>
          <p className="mt-1 text-sm text-hbl-muted">
            {result.customerName} · {formatKobo(result.totalAmountKobo)}
          </p>

          {result.canReschedule ? (
            <Alert
              className="mt-4"
              type="warning"
              showIcon
              message="This appointment was missed"
              description="You can pick a new time once for free — no extra payment."
              action={
                <Button size="small" type="primary" onClick={() => setRescheduleOpen((v) => !v)}>
                  {rescheduleOpen ? "Hide" : "Reschedule"}
                </Button>
              }
            />
          ) : null}

          {rescheduleOpen && result.canReschedule ? (
            <div className="mt-6 border-t border-black/10 pt-6">
              <Typography.Title level={5} className="mt-0!">
                Choose a new time
              </Typography.Title>
              <DatePicker
                value={date}
                onChange={(d) => d && setDate(d)}
                disabledDate={(d) => d.isBefore(dayjs(), "day")}
                className="mb-4 w-full max-w-xs"
                allowClear={false}
              />
              {slotLoading ? (
                <div className="flex justify-center py-6">
                  <Spin />
                </div>
              ) : null}
              {slotHint && !slotLoading ? (
                <p className="text-sm text-hbl-muted">{slotHint}</p>
              ) : null}
              {!slotLoading && slots.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => {
                    const selected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`border px-3 py-2 text-sm transition-colors ${
                          selected
                            ? "border-hbl-primary bg-hbl-primary text-white"
                            : "border-black/15 bg-white text-hbl-ink hover:border-hbl-primary"
                        }`}
                      >
                        {formatSlotTime(slot)}
                      </button>
                    );
                  })}
                </div>
              ) : null}
              <Button
                type="primary"
                className="mt-4"
                block
                size="large"
                loading={rescheduling}
                disabled={!selectedSlot}
                onClick={() => void onReschedule()}
              >
                Confirm new time (free)
              </Button>
            </div>
          ) : null}

          <Typography.Title level={5} className="mt-8!">
            Timeline
          </Typography.Title>
          <Timeline
            items={[...(result.statusHistory ?? [])].reverse().map((h) => ({
              children: (
                <div>
                  <div className="font-medium">{h.status}</div>
                  <div className="text-xs text-hbl-muted">{formatDateTime(h.at)}</div>
                  {h.note ? <div className="text-sm text-hbl-muted">{h.note}</div> : null}
                </div>
              ),
            }))}
          />
        </motion.div>
      ) : null}
    </>
  );
}

export default function TrackPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-hbl-bg text-hbl-ink">
      <SiteHeader active="track" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          }
        >
          <TrackPageInner />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
