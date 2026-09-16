import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { recordCreditTransaction } from "@/lib/sms-credits";

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

function serviceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

const SMS_PAYSTACK_SECRET = process.env.SMS_PAYSTACK_SECRET_KEY;

/**
 * POST /api/sms-credits/verify  { reference }
 * Verifies the Paystack transaction against the owner's account and, on success,
 * credits the account (idempotent by reference).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!SMS_PAYSTACK_SECRET) return NextResponse.json({ error: "Not configured" }, { status: 400 });

    const { reference } = await request.json();
    if (!reference) return NextResponse.json({ error: "reference is required" }, { status: 400 });

    const supabase = serviceClient();

    // Idempotency: already recorded?
    const { data: existing } = await supabase
      .from("sms_credit_transactions")
      .select("id")
      .eq("reference", reference)
      .eq("type", "PURCHASE")
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ success: true, alreadyRecorded: true });
    }

    // Verify with Paystack (owner's account)
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${SMS_PAYSTACK_SECRET}` },
    });
    const data = await res.json();
    if (!res.ok || !data.status || data.data?.status !== "success") {
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
    }

    const credits = Math.floor(Number(data.data?.metadata?.credits) || 0);
    const amountPaid = Number(data.data?.amount || 0) / 100;
    if (credits <= 0) return NextResponse.json({ error: "No credits in this transaction" }, { status: 400 });

    const balanceAfter = await recordCreditTransaction(supabase, {
      type: "PURCHASE",
      credits,
      description: `Purchased ${credits} SMS credits`,
      reference,
      amount_paid: amountPaid,
      created_by: user.id,
    });

    // Clear any low-balance alert flag now that credits are topped up
    if (balanceAfter > 50) {
      await supabase.from("settings").upsert({ key: "sms_low_alert_sent", value: "false" });
    }

    return NextResponse.json({ success: true, credits, balance: balanceAfter });
  } catch (error) {
    console.error("SMS credit verify error:", error);
    return NextResponse.json({ error: "Failed to verify purchase" }, { status: 500 });
  }
}
