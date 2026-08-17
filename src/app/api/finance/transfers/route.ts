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

    const { from_account_id, to_account_id, amount, description } = await request.json();

    if (!from_account_id || !to_account_id || !amount) {
      return NextResponse.json({ error: "from_account_id, to_account_id, and amount are required" }, { status: 400 });
    }

    if (from_account_id === to_account_id) {
      return NextResponse.json({ error: "Cannot transfer to the same account" }, { status: 400 });
    }

    const transferAmount = Number(amount);
    if (transferAmount <= 0) {
      return NextResponse.json({ error: "Amount must be positive" }, { status: 400 });
    }

    const supabase = serviceClient();

    // Fetch source account to check balance
    const { data: fromAccount, error: fromErr } = await supabase
      .from("finance_accounts")
      .select("id, name, balance")
      .eq("id", from_account_id)
      .single();

    if (fromErr || !fromAccount) {
      return NextResponse.json({ error: "Source account not found" }, { status: 404 });
    }

    if (Number(fromAccount.balance) < transferAmount) {
      return NextResponse.json({ error: `Insufficient balance in ${fromAccount.name} (GH₵${fromAccount.balance})` }, { status: 400 });
    }

    // Deduct from source
    await supabase
      .from("finance_accounts")
      .update({ balance: Number(fromAccount.balance) - transferAmount, updated_at: new Date().toISOString() })
      .eq("id", from_account_id);

    // Add to destination
    const { data: toAccount } = await supabase
      .from("finance_accounts")
      .select("balance")
      .eq("id", to_account_id)
      .single();

    await supabase
      .from("finance_accounts")
      .update({ balance: Number(toAccount?.balance || 0) + transferAmount, updated_at: new Date().toISOString() })
      .eq("id", to_account_id);

    // Record the transfer
    const ref = `TRF-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await supabase
      .from("finance_transfers")
      .insert({
        from_account_id,
        to_account_id,
        amount: transferAmount,
        description: description || null,
        reference: ref,
        transferred_by: user.id,
      })
      .select("*, from_account:finance_accounts!from_account_id(*), to_account:finance_accounts!to_account_id(*)")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Transfer error:", error);
    return NextResponse.json({ error: "Transfer failed" }, { status: 500 });
  }
}
