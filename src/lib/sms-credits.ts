import { createServerClient } from "@supabase/ssr";
import { sendSms } from "@/lib/hubtel-sms";

/**
 * SMS credit ledger. Balance = SUM(credits) across sms_credit_transactions.
 * Owner sells credits; every SMS segment sent deducts 1 credit.
 */

export const SMS_CREDIT_PRICE = Number(process.env.SMS_CREDIT_PRICE || "0.10"); // GHS per credit, owner-only (env)
export const SMS_LOW_THRESHOLD = 50;

function service() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

// GSM segment count: <=160 chars = 1, otherwise 153 chars per segment
export function segmentsFor(message: string): number {
  const len = (message || "").length;
  if (len <= 160) return 1;
  return Math.ceil(len / 153);
}

type SC = ReturnType<typeof service>;

// The credit paywall only applies once the owner has sold at least one batch of
// credits. Before the first purchase, SMS flows normally (no gating, no deduction).
export async function isCreditsActive(supabase?: SC): Promise<boolean> {
  const sb = supabase || service();
  const { data, error } = await sb.from("sms_credit_transactions").select("id").eq("type", "PURCHASE").limit(1);
  if (error) return false;
  return (data || []).length > 0;
}

export async function getCreditBalance(supabase?: SC): Promise<number> {
  const sb = supabase || service();
  const { data, error } = await sb.from("sms_credit_transactions").select("credits");
  if (error) return 0;
  return (data || []).reduce((s, r) => s + Number(r.credits), 0);
}

export async function recordCreditTransaction(
  sb: SC,
  tx: {
    type: "PURCHASE" | "USAGE" | "ADJUSTMENT";
    credits: number;
    description?: string;
    reference?: string | null;
    amount_paid?: number | null;
    recipient?: string | null;
    message_id?: string | null;
    created_by?: string | null;
  },
): Promise<number> {
  const current = await getCreditBalance(sb);
  const balanceAfter = current + tx.credits;
  await sb.from("sms_credit_transactions").insert({
    type: tx.type,
    credits: tx.credits,
    balance_after: balanceAfter,
    description: tx.description || null,
    reference: tx.reference || null,
    amount_paid: tx.amount_paid ?? null,
    recipient: tx.recipient || null,
    message_id: tx.message_id || null,
    created_by: tx.created_by || null,
  });
  return balanceAfter;
}

// Fire a low-balance alert SMS to admins once per time balance drops through the threshold.
async function maybeLowBalanceAlert(sb: SC, balanceAfter: number) {
  try {
    const { data: flagRow } = await sb.from("settings").select("value").eq("key", "sms_low_alert_sent").maybeSingle();
    const alreadySent = flagRow?.value === "true";

    if (balanceAfter > SMS_LOW_THRESHOLD) {
      if (alreadySent) await sb.from("settings").upsert({ key: "sms_low_alert_sent", value: "false" });
      return;
    }
    if (alreadySent) return; // already warned for this low period

    // Notify admins/managers with a phone number
    const { data: admins } = await sb
      .from("profiles")
      .select("phone, role")
      .in("role", ["admin", "super_admin", "manager"]);
    const phones = [...new Set((admins || []).map((a) => a.phone).filter(Boolean))] as string[];
    const msg = `WPTC SMS credits are low: ${Math.max(0, Math.floor(balanceAfter))} left. Top up to keep automated texts (booking confirmations, reminders) sending.`;
    for (const phone of phones) {
      // critical so the alert itself is never blocked by the credit gate
      await sendSms({ to: phone, message: msg, critical: true, purpose: "Low-credit alert" }).catch(() => {});
    }
    await sb.from("settings").upsert({ key: "sms_low_alert_sent", value: "true" });
  } catch {
    // best-effort
  }
}

/**
 * Called by sendSms AFTER a successful Hubtel send to deduct credits and
 * trigger a low-balance alert when crossing the threshold.
 */
export async function deductCreditsForSend(message: string, recipient: string, purpose?: string) {
  const sb = service();
  const segs = segmentsFor(message);
  const balanceAfter = await recordCreditTransaction(sb, {
    type: "USAGE",
    credits: -segs,
    description: purpose || "SMS sent",
    recipient,
  });
  await maybeLowBalanceAlert(sb, balanceAfter);
  return balanceAfter;
}

// Returns true if there are enough credits to send `message`.
export async function hasCreditsFor(message: string): Promise<boolean> {
  const balance = await getCreditBalance();
  return balance >= segmentsFor(message);
}

export class NoCreditsError extends Error {
  constructor() {
    super("Insufficient SMS credits");
    this.name = "NoCreditsError";
  }
}
