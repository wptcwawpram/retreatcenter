import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const supabase = serviceClient();

    const amount = Number(body.amount);
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    // Insert finance record — try with new columns, fall back if migration not run yet
    const baseRecord = {
      type: body.type,
      category: body.category,
      description: body.description,
      amount,
      date: body.date || new Date().toISOString().split("T")[0],
      recorded_by: user.id,
      booking_id: body.booking_id || null,
    };

    let data;
    const fullRecord = {
      ...baseRecord,
      account_id: body.account_id || null,
      category_id: body.category_id || null,
      reference: body.reference || null,
      payment_method: body.payment_method || null,
    };

    const { data: d1, error: e1 } = await supabase
      .from("finance_records")
      .insert(fullRecord)
      .select()
      .single();

    if (e1 && e1.message?.includes("column")) {
      const { data: d2, error: e2 } = await supabase
        .from("finance_records")
        .insert(baseRecord)
        .select()
        .single();
      if (e2) throw e2;
      data = d2;
    } else if (e1) {
      throw e1;
    } else {
      data = d1;
    }

    // Update account balance if an account is specified
    if (body.account_id) {
      const { data: account } = await supabase
        .from("finance_accounts")
        .select("balance")
        .eq("id", body.account_id)
        .single();

      if (account) {
        const currentBalance = Number(account.balance);
        const newBalance = body.type === "INCOME"
          ? currentBalance + amount
          : currentBalance - amount;

        await supabase
          .from("finance_accounts")
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq("id", body.account_id);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Create finance record error:", error);
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}
