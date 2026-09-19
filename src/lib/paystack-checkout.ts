import { abandonPayment, initializePayment } from "@/lib/api";

export type OpenPaystackOptions = {
  appointmentId: string;
  email: string;
  onSuccess: (reference: string) => void;
  onCancel: (reference: string) => void;
};

export async function openPaystackForAppointment(
  options: OpenPaystackOptions,
): Promise<{ reference: string }> {
  const { appointmentId, email, onSuccess, onCancel } = options;

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set");
  }

  const { accessCode, reference } = await initializePayment(appointmentId);

  const PaystackInline = (await import("@paystack/inline-js")).default;
  const popup = new PaystackInline();
  popup.newTransaction({
    key: publicKey,
    email,
    accessCode,
    onSuccess: () => onSuccess(reference),
    onCancel: () => {
      void abandonPayment(reference, email).catch(() => undefined);
      onCancel(reference);
    },
  });

  return { reference };
}
