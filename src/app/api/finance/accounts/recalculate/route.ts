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

/**
 * POST /api/finance/accounts/recalculate
 * Reconciles every account's stored balance to the actual source of truth:
 *   balance = opening_balance
 *           + Σ(INCOME records) − Σ(EXPENSE records)
 *           + Σ(transfers in)   − Σ(transfers out)
 *
 * This flushes any drift that accumulated when records were deleted before the
 * balance-reversal fix existed. Opening balance is read from the account's
 * `opening_balance` column when present, otherwise treated as 0.
 *
 * Optional body: { account_id } to recalc a single account.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let onlyAccountId: string | null = null;
    try {
      const body = await request.json();
      onlyAccountId = body?.account_id || null;
    } catch {}

    const supabase = serviceClient();

    // Load accounts
    let accountsQuery = supabase.from("finance_accounts").select("*");
    if (onlyAccountId) accountsQuery = accountsQuery.eq("id", onlyAccountId);
    const { data: accounts, error: acctErr } = await accountsQuery;
    if (acctErr) throw acctErr;

    // Load all records and transfers once
    const { data: records } = await supabase
      .from("finance_records")
      .select("account_id, amount, type");
    const { data: transfers } = await supabase
      .from("finance_transfers")
      .select("from_account_id, to_account_id, amount");

    const results: Array<{ id: string; name: string; balance: number }> = [];

    for (const acct of accounts || []) {
      const openingBalance = "opening_balance" in acct ? Number(acct.opening_balance) || 0 : 0;

      const income = (records || [])
        .filter((r) => r.account_id === acct.id && r.type === "INCOME")
        .reduce((s, r) => s + Number(r.amount), 0);
      const expense = (records || [])
        .filter((r) => r.account_id === acct.id && r.type === "EXPENSE")
        .reduce((s, r) => s + Number(r.amount), 0);
      const transfersIn = (transfers || [])
        .filter((t) => t.to_account_id === acct.id)
        .reduce((s, t) => s + Number(t.amount), 0);
      const transfersOut = (transfers || [])
        .filter((t) => t.from_account_id === acct.id)
        .reduce((s, t) => s + Number(t.amount), 0);

      const newBalance = openingBalance + income - expense + transfersIn - transfersOut;

      await supabase
        .from("finance_accounts")
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq("id", acct.id);

      results.push({ id: acct.id, name: acct.name, balance: newBalance });
    }

    return NextResponse.json({ success: true, accounts: results });
  } catch (error) {
    console.error("Recalculate balances error:", error);
    const msg = error instanceof Error ? error.message : "Failed to recalculate balances";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
