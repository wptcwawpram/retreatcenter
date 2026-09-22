import { createServerClient } from "@supabase/ssr";
import { sendSms } from "@/lib/hubtel-sms";
import { segmentsFor } from "@/lib/sms-credits";

/**
 * Manual Hubtel wallet balance tracker.
 * The superadmin enters the current Hubtel balance; every SMS sent (here or in
 * a linked project reporting via /api/hubtel/usage) deducts its cost. Alerts are
 * sent when the balance drops through configured thresholds.
 */

const THRESHOLDS = [20, 10, 5, 2];
const DEFAULT_COST = 0.03; // GHS per SMS segment (superadmin can change)

function service() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}
type SC = ReturnType<typeof service>;

async function getSetting(sb: SC, key: string): Promise<string | null> {
  const { data } = await sb.from("settings").select("value").eq("key", key).maybeSingle();
  return data?.value ?? null;
}
async function setSetting(sb: SC, key: string, value: string) {
  await sb.from("settings").upsert({ key, value });
}

// Active only once the superadmin has entered a starting balance
export async function isTrackerActive(sb?: SC): Promise<boolean> {
  const s = sb || service();
  return (await getSetting(s, "hubtel_balance")) !== null;
}

export async function getHubtelState(sb?: SC) {
  const s = sb || service();
  const [bal, cost, numbers] = await Promise.all([
    getSetting(s, "hubtel_balance"),
    getSetting(s, "hubtel_cost_per_sms"),
    getSetting(s, "hubtel_alert_numbers"),
  ]);
  return {
    balance: bal === null ? null : Number(bal),
    costPerSms: cost === null ? DEFAULT_COST : Number(cost),
    alertNumbers: numbers || "",
    configured: bal !== null,
    reportSecretSet: !!process.env.HUBTEL_USAGE_SECRET,
  };
}

async function readAlertState(sb: SC): Promise<Record<string, boolean>> {
  const raw = await getSetting(sb, "hubtel_alert_state");
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

async function ledger(sb: SC, entry: { type: "TOPUP" | "USAGE" | "ADJUSTMENT"; amount: number; segments?: number; source?: string; description?: string; balanceAfter: number; createdBy?: string | null }) {
  await sb.from("hubtel_ledger").insert({
    type: entry.type, amount: entry.amount, segments: entry.segments ?? null,
    source: entry.source ?? null, description: entry.description ?? null,
    balance_after: entry.balanceAfter, created_by: entry.createdBy ?? null,
  }).then(() => {}, () => {});
}

async function maybeAlert(sb: SC, balance: number) {
  const state = await readAlertState(sb);
  const crossed = THRESHOLDS.filter((t) => balance <= t);
  if (crossed.length === 0) return;
  const lowest = Math.min(...crossed);
  if (state[String(lowest)]) return; // already alerted at this depth

  const numbers = ((await getSetting(sb, "hubtel_alert_numbers")) || "")
    .split(/[,\s]+/).map((n) => n.trim()).filter(Boolean);
  const msg = `WPTC Hubtel SMS balance is low: about GH₵${balance.toFixed(2)} left (below GH₵${lowest}). Please top up your Hubtel account.`;
  for (const to of numbers) {
    await sendSms({ to, message: msg, critical: true, purpose: "Hubtel low-balance alert" }).catch(() => {});
  }
  crossed.forEach((t) => { state[String(t)] = true; });
  await setSetting(sb, "hubtel_alert_state", JSON.stringify(state));
}

// Deduct the cost of an SMS (by segment count) from the tracked balance.
export async function recordHubtelUsage(opts: { segments?: number; message?: string; source?: string; description?: string }) {
  const sb = service();
  if (!(await isTrackerActive(sb))) return; // not set up yet — don't track
  const segs = opts.segments ?? (opts.message ? segmentsFor(opts.message) : 1);
  const cost = Number(await getSetting(sb, "hubtel_cost_per_sms")) || DEFAULT_COST;
  const balance = Number(await getSetting(sb, "hubtel_balance")) || 0;
  const newBalance = Math.round((balance - cost * segs) * 10000) / 10000;
  await setSetting(sb, "hubtel_balance", String(newBalance));
  await ledger(sb, { type: "USAGE", amount: -(cost * segs), segments: segs, source: opts.source || "retreatcenter", description: opts.description || "SMS sent", balanceAfter: newBalance });
  await maybeAlert(sb, newBalance);
  return newBalance;
}

// Superadmin sets the actual current balance (after topping up Hubtel).
export async function setHubtelBalance(newBalance: number, note: string, userId?: string | null) {
  const sb = service();
  await setSetting(sb, "hubtel_balance", String(newBalance));
  await ledger(sb, { type: "TOPUP", amount: newBalance, description: note || "Balance set by admin", balanceAfter: newBalance, createdBy: userId });
  // Re-arm alerts for thresholds now above the balance
  const state = await readAlertState(sb);
  THRESHOLDS.forEach((t) => { if (newBalance > t) state[String(t)] = false; });
  await setSetting(sb, "hubtel_alert_state", JSON.stringify(state));
  return newBalance;
}

export async function setHubtelConfig(cfg: { costPerSms?: number; alertNumbers?: string }) {
  const sb = service();
  if (cfg.costPerSms != null && !Number.isNaN(cfg.costPerSms)) await setSetting(sb, "hubtel_cost_per_sms", String(cfg.costPerSms));
  if (cfg.alertNumbers != null) await setSetting(sb, "hubtel_alert_numbers", cfg.alertNumbers);
}

export async function getHubtelLedger(limit = 100) {
  const sb = service();
  const { data } = await sb.from("hubtel_ledger").select("*").order("created_at", { ascending: false }).limit(limit);
  return data || [];
}
