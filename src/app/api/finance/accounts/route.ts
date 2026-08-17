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

    const { data, error } = await supabase
      .from("finance_accounts")
      .insert({
        name: body.name,
        type: body.type,
        provider: body.provider || null,
        account_number: body.account_number || null,
        balance: Number(body.balance) || 0,
        currency: body.currency || "GHS",
        is_default: body.is_default || false,
        is_active: true,
        notes: body.notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Create finance account error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, ...updates } = await request.json();
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const supabase = serviceClient();
    const { error } = await supabase
      .from("finance_accounts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update finance account error:", error);
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }
}
