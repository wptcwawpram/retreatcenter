import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getHubtelState, getHubtelLedger, setHubtelBalance, setHubtelConfig } from "@/lib/hubtel-balance";

// Returns the current user's id + role, or null
async function getRole() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const service = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
  const { data: profile } = await service.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return { id: user.id, role: profile?.role || null };
}

// GET /api/hubtel — superadmin only: balance, config, ledger
export async function GET() {
  const me = await getRole();
  if (!me || me.role !== "super_admin") return NextResponse.json({ error: "Not found" }, { status: 404 });

  const state = await getHubtelState();
  const ledger = await getHubtelLedger(100);
  return NextResponse.json({ ...state, ledger });
}

// POST /api/hubtel — superadmin only: set balance or config
export async function POST(request: NextRequest) {
  const me = await getRole();
  if (!me || me.role !== "super_admin") return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  if (body.action === "set_balance") {
    const bal = Number(body.balance);
    if (Number.isNaN(bal)) return NextResponse.json({ error: "Invalid balance" }, { status: 400 });
    await setHubtelBalance(bal, body.note || "Balance set by superadmin", me.id);
    return NextResponse.json({ success: true, balance: bal });
  }
  if (body.action === "config") {
    await setHubtelConfig({
      costPerSms: body.cost_per_sms != null ? Number(body.cost_per_sms) : undefined,
      alertNumbers: body.alert_numbers != null ? String(body.alert_numbers) : undefined,
    });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
