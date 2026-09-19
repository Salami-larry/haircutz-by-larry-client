import type {
  Appointment,
  AvailabilityResult,
  Hairstyle,
  Paginated,
  ServiceType,
  TrackResult,
} from "./types";

export type { Appointment, AvailabilityResult, Hairstyle, Paginated, ServiceType, TrackResult };

function baseURL(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not set");
  return base.replace(/\/$/, "");
}

async function parseErrorBody(res: Response): Promise<{ message: string; code?: string }> {
  try {
    const data = (await res.json()) as { error?: string; code?: string };
    if (data.error) {
      return { message: data.error, code: data.code };
    }
  } catch {
    // ignore
  }
  return { message: res.statusText || "Request failed" };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function throwApiError(res: Response, body: { message: string; code?: string }): never {
  throw new ApiError(body.message, res.status, body.code);
}

export type VerifyPaymentResult = {
  appointmentId: string;
  status: string;
  trackingNumber?: string;
  paystackStatus?: string;
  customerEmail: string;
};

export async function listHairstyles(params?: {
  q?: string;
  page?: number;
  page_size?: number;
}): Promise<Paginated<Hairstyle>> {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.page !== undefined) search.set("page", String(params.page));
  if (params?.page_size !== undefined) search.set("page_size", String(params.page_size));
  const qs = search.toString();
  const res = await fetch(`${baseURL()}/api/v1/hairstyles${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
  });
  if (!res.ok) throwApiError(res, await parseErrorBody(res));
  return (await res.json()) as Paginated<Hairstyle>;
}

export async function getHairstyle(id: string): Promise<Hairstyle> {
  const res = await fetch(`${baseURL()}/api/v1/hairstyles/${id}`, { cache: "no-store" });
  if (!res.ok) throwApiError(res, await parseErrorBody(res));
  return (await res.json()) as Hairstyle;
}

export async function getAvailability(params: {
  date: string;
  hairstyleId: string;
  serviceType: ServiceType;
}): Promise<AvailabilityResult> {
  const search = new URLSearchParams({
    date: params.date,
    hairstyleId: params.hairstyleId,
    serviceType: params.serviceType,
  });
  const res = await fetch(`${baseURL()}/api/v1/availability?${search}`, { cache: "no-store" });
  if (!res.ok) throwApiError(res, await parseErrorBody(res));
  return (await res.json()) as AvailabilityResult;
}

export async function createAppointment(body: {
  hairstyleId: string;
  serviceType: ServiceType;
  startAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    notes?: string;
  };
}): Promise<Appointment> {
  const res = await fetch(`${baseURL()}/api/v1/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throwApiError(res, await parseErrorBody(res));
  return (await res.json()) as Appointment;
}

export async function initializePayment(
  appointmentId: string,
): Promise<{ accessCode: string; reference: string; authorizationUrl?: string }> {
  const res = await fetch(`${baseURL()}/api/v1/payments/initialize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appointmentId }),
  });
  if (!res.ok) throwApiError(res, await parseErrorBody(res));
  return (await res.json()) as {
    accessCode: string;
    reference: string;
    authorizationUrl?: string;
  };
}

export async function abandonPayment(reference: string, email: string): Promise<void> {
  const res = await fetch(`${baseURL()}/api/v1/payments/abandon`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference, email }),
  });
  if (!res.ok) throwApiError(res, await parseErrorBody(res));
}

export async function verifyPayment(reference: string): Promise<VerifyPaymentResult> {
  const res = await fetch(
    `${baseURL()}/api/v1/payments/verify?reference=${encodeURIComponent(reference)}`,
    { cache: "no-store" },
  );
  if (!res.ok) throwApiError(res, await parseErrorBody(res));
  return (await res.json()) as VerifyPaymentResult;
}

export async function trackAppointment(body: {
  trackingNumber: string;
  email: string;
}): Promise<TrackResult> {
  const res = await fetch(`${baseURL()}/api/v1/appointments/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throwApiError(res, await parseErrorBody(res));
  return (await res.json()) as TrackResult;
}

export async function rescheduleAppointment(body: {
  appointmentId: string;
  trackingNumber: string;
  email: string;
  startAt: string;
}): Promise<Appointment> {
  const res = await fetch(`${baseURL()}/api/v1/appointments/${body.appointmentId}/reschedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      trackingNumber: body.trackingNumber,
      email: body.email,
      startAt: body.startAt,
    }),
  });
  if (!res.ok) throwApiError(res, await parseErrorBody(res));
  return (await res.json()) as Appointment;
}
