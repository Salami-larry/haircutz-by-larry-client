"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  Radio,
  Spin,
  Typography,
  message,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { motion } from "framer-motion";

import {
  ApiError,
  createAppointment,
  getAvailability,
  type Hairstyle,
  type ServiceType,
} from "@/lib/api";
import { formatDuration, formatKobo, formatSlotTime } from "@/lib/format";
import { openPaystackForAppointment } from "@/lib/paystack-checkout";

type Props = {
  style: Hairstyle;
};

type BookForm = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
};

export function BookStylePanel({ style }: Props) {
  const router = useRouter();
  const [serviceType, setServiceType] = useState<ServiceType>("walk_in");
  const [date, setDate] = useState<Dayjs>(() => dayjs());
  const [slots, setSlots] = useState<string[]>([]);
  const [closed, setClosed] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [, startTransition] = useTransition();
  const [form] = Form.useForm<BookForm>();

  const priceKobo =
    serviceType === "home_service" ? style.homeServicePriceKobo : style.walkInPriceKobo;

  const loadSlots = useCallback(async () => {
    if (!date) return;
    setSlotLoading(true);
    setSlotError(null);
    setSelectedSlot(null);
    try {
      const result = await getAvailability({
        date: date.format("YYYY-MM-DD"),
        hairstyleId: style.id,
        serviceType,
      });
      setClosed(result.closed);
      setSlots(result.slots ?? []);
    } catch (e) {
      setSlots([]);
      setClosed(false);
      setSlotError(e instanceof ApiError ? e.message : "Could not load slots");
    } finally {
      setSlotLoading(false);
    }
  }, [date, serviceType, style.id]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  const slotHint = useMemo(() => {
    if (closed) return "Closed for this service on the selected day.";
    if (!slotLoading && slots.length === 0) return "No open slots — try another day.";
    return null;
  }, [closed, slotLoading, slots.length]);

  async function onFinish(values: BookForm) {
    if (!selectedSlot) {
      message.warning("Pick a time slot");
      return;
    }
    setSubmitting(true);
    try {
      const appt = await createAppointment({
        hairstyleId: style.id,
        serviceType,
        startAt: selectedSlot,
        customer: {
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address,
          notes: values.notes,
        },
      });

      await openPaystackForAppointment({
        appointmentId: appt.id,
        email: values.email,
        onSuccess: (reference) => {
          startTransition(() => {
            router.push(`/book/success?reference=${encodeURIComponent(reference)}`);
          });
        },
        onCancel: (reference) => {
          startTransition(() => {
            router.push(
              `/book/success?reference=${encodeURIComponent(reference)}&pending=1`,
            );
          });
        },
      });
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="border-t border-black/10 pt-8"
      style={{ willChange: "opacity, transform" }}
    >
      <Typography.Title level={3} className="font-display mt-0!">
        Book this style
      </Typography.Title>
      <p className="mb-6 text-sm text-hbl-muted">
        {formatDuration(style.durationMinutes)} · {formatKobo(priceKobo)} · Africa/Lagos
      </p>

      <div className="mb-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-hbl-muted">
          Service
        </p>
        <Radio.Group
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value as ServiceType)}
          optionType="button"
          buttonStyle="solid"
          options={[
            { value: "walk_in", label: `Walk-in · ${formatKobo(style.walkInPriceKobo)}` },
            {
              value: "home_service",
              label: `Home · ${formatKobo(style.homeServicePriceKobo)}`,
            },
          ]}
        />
        {serviceType === "home_service" ? (
          <p className="mt-2 text-xs text-hbl-muted">
            Home service Mon–Sat 10:00–17:00 (not available Sundays). Lagos only.
          </p>
        ) : (
          <p className="mt-2 text-xs text-hbl-muted">
            Walk-in Mon–Sat 09:00–22:00, Sun 12:00–22:00.
          </p>
        )}
      </div>

      <div className="mb-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-hbl-muted">
          Day
        </p>
        <DatePicker
          value={date}
          onChange={(d) => d && setDate(d)}
          disabledDate={(d) => d.isBefore(dayjs(), "day")}
          className="w-full max-w-xs"
          allowClear={false}
        />
      </div>

      <div className="mb-8">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-hbl-muted">
          Time
        </p>
        {slotLoading ? (
          <div className="flex justify-center py-6">
            <Spin />
          </div>
        ) : null}
        {slotError ? <Alert type="error" message={slotError} showIcon className="mb-3" /> : null}
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
      </div>

      <Form form={form} layout="vertical" onFinish={(v) => void onFinish(v)} requiredMark={false}>
        <Form.Item
          name="name"
          label="Full name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input size="large" placeholder="Your name" />
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
        <Form.Item
          name="phone"
          label="Phone"
          rules={[{ required: true, message: "Phone is required" }]}
        >
          <Input size="large" placeholder="+234…" />
        </Form.Item>
        {serviceType === "home_service" ? (
          <Form.Item
            name="address"
            label="Address / area (Lagos)"
            rules={[{ required: true, message: "Address is required for home service" }]}
          >
            <Input.TextArea rows={2} placeholder="Street, area, landmark" />
          </Form.Item>
        ) : null}
        <Form.Item name="notes" label="Notes (optional)">
          <Input.TextArea rows={2} placeholder="Anything Larry should know" />
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
          Pay {formatKobo(priceKobo)}
        </Button>
        <p className="mt-3 text-center text-xs text-hbl-muted">
          Payments are non-refundable.{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>
        </p>
      </Form>
    </motion.section>
  );
}
