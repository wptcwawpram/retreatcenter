import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getCreditBalance, isCreditsActive, SMS_CREDIT_PRICE, SMS_LOW_THRESHOLD } from "@/lib/sms-credits";

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

// GET /api/sms-credits — balance, price, and recent audit transactions
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = serviceClient();
    const balance = await getCreditBalance(supabase);
    const active = await isCreditsActive(supabase);

    const { data: transactions } = await supabase
      .from("sms_credit_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    return NextResponse.json({
      balance,
      active,
      price: SMS_CREDIT_PRICE,
      lowThreshold: SMS_LOW_THRESHOLD,
      purchaseConfigured: !!process.env.SMS_PAYSTACK_SECRET_KEY,
      transactions: transactions || [],
    });
  } catch (error) {
    console.error("SMS credits GET error:", error);
    return NextResponse.json({ error: "Failed to load SMS credits" }, { status: 500 });
  }
}
