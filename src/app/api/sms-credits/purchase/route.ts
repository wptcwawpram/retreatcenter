import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SMS_CREDIT_PRICE } from "@/lib/sms-credits";

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

// Uses the OWNER's separate Paystack account (SMS_PAYSTACK_SECRET_KEY) so credit
// payments land in a different account from booking income.
const SMS_PAYSTACK_SECRET = process.env.SMS_PAYSTACK_SECRET_KEY;

/**
 * POST /api/sms-credits/purchase
 * Body: { email, credits }  -> initializes a Paystack transaction for credits * price.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!SMS_PAYSTACK_SECRET) {
      return NextResponse.json({ error: "SMS credit purchases are not configured yet. Add SMS_PAYSTACK_SECRET_KEY." }, { status: 400 });
    }

    const { email, credits } = await request.json();
    const nCredits = Math.floor(Number(credits) || 0);
    if (!email) return NextResponse.json({ error: "Email is required for the receipt" }, { status: 400 });
    if (nCredits <= 0) return NextResponse.json({ error: "Enter how many credits to buy" }, { status: 400 });

    // Price computed server-side so it cannot be tampered with
    const amountGhs = nCredits * SMS_CREDIT_PRICE;
    const reference = `SMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${SMS_PAYSTACK_SECRET}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        amount: Math.round(amountGhs * 100), // pesewas
        reference,
        currency: "GHS",
        metadata: {
          purpose: "sms_credits",
          credits: nCredits,
          purchased_by: user.id,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.status) {
      return NextResponse.json({ error: data.message || "Failed to start payment" }, { status: 500 });
    }

    return NextResponse.json({
      access_code: data.data.access_code,
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
      credits: nCredits,
      amount: amountGhs,
    });
  } catch (error) {
    console.error("SMS credit purchase init error:", error);
    return NextResponse.json({ error: "Failed to start purchase" }, { status: 500 });
  }
}
