import crypto from "crypto";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE = "https://api.paystack.co";

interface InitializePaymentParams {
  email: string;
  amount: number; // in pesewas (GHS * 100)
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface InitializeData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface VerifyData {
  id: number;
  status: "success" | "failed" | "abandoned";
  reference: string;
  amount: number;
  currency: string;
  channel: string;
  paid_at: string;
  customer: { email: string };
  metadata: Record<string, unknown>;
}

async function paystackFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<PaystackResponse<T>> {
  const res = await fetch(`${PAYSTACK_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Paystack error: ${res.status} ${error}`);
  }
  return res.json();
}

export async function initializePayment(params: InitializePaymentParams) {
  return paystackFetch<InitializeData>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      callback_url: params.callbackUrl,
      currency: "GHS",
      metadata: params.metadata,
    }),
  });
}

export async function verifyPayment(reference: string) {
  return paystackFetch<VerifyData>(`/transaction/verify/${reference}`);
}

// Verify webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string,
): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(body)
    .digest("hex");
  return hash === signature;
}

export type { InitializePaymentParams, VerifyData, InitializeData };
