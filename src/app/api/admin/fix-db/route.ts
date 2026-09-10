import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c) => {
          try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    },
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
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await request.json();
  const supabase = serviceClient();
  const results: Record<string, unknown> = {};

  // Fix Holy Family room prices in the live DB
  if (action === "fix-hf-prices" || action === "all") {
    const updates = [
      { number: "HF1", price_per_night: 150 },
      { number: "HF2", price_per_night: 150 },
      { number: "HF3", price_per_night: 0 },
    ];
    const errors: string[] = [];
    for (const u of updates) {
      const { error } = await supabase
        .from("rooms")
        .update({ price_per_night: u.price_per_night })
        .eq("number", u.number);
      if (error) errors.push(`${u.number}: ${error.message}`);
    }
    results["fix-hf-prices"] = errors.length ? { errors } : { ok: true, message: "HF1=150, HF2=150, HF3=0" };
  }

  // Delete incorrectly auto-created income records from booking creation
  // These have category "Room Booking" (the bug) vs "Booking Payment" (correct)
  if (action === "delete-phantom-income" || action === "all") {
    const { data: deleted, error } = await supabase
      .from("finance_records")
      .delete()
      .eq("type", "INCOME")
      .eq("category", "Room Booking")
      .select("id, amount, description");
    results["delete-phantom-income"] = error
      ? { error: error.message }
      : { ok: true, deleted: deleted?.length ?? 0, records: deleted };
  }

  return NextResponse.json({ success: true, results });
}
