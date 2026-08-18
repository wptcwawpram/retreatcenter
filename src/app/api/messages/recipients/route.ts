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

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const segment = searchParams.get("segment") || "all_guests";

    const supabase = serviceClient();
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    let recipients: { name: string; phone: string }[] = [];

    if (segment === "all_guests") {
      const { data } = await supabase.from("guests").select("full_name, phone").not("phone", "is", null);
      recipients = (data || []).map((g) => ({ name: g.full_name, phone: g.phone })).filter((r) => r.phone);

    } else if (segment === "current_guests") {
      const { data } = await supabase
        .from("bookings")
        .select("guest:guests(full_name, phone)")
        .eq("status", "CHECKED_IN");
      recipients = (data || [])
        .map((b: Record<string, unknown>) => {
          const guest = b.guest as { full_name: string; phone: string } | null;
          return guest ? { name: guest.full_name, phone: guest.phone } : null;
        })
        .filter((r): r is { name: string; phone: string } => r !== null && !!r.phone);

    } else if (segment === "checking_in_today") {
      const { data } = await supabase
        .from("bookings")
        .select("guest:guests(full_name, phone)")
        .eq("check_in", today)
        .in("status", ["CONFIRMED", "PENDING"]);
      recipients = (data || [])
        .map((b: Record<string, unknown>) => {
          const guest = b.guest as { full_name: string; phone: string } | null;
          return guest ? { name: guest.full_name, phone: guest.phone } : null;
        })
        .filter((r): r is { name: string; phone: string } => r !== null && !!r.phone);

    } else if (segment === "checking_in_tomorrow") {
      const { data } = await supabase
        .from("bookings")
        .select("guest:guests(full_name, phone)")
        .eq("check_in", tomorrow)
        .in("status", ["CONFIRMED", "PENDING"]);
      recipients = (data || [])
        .map((b: Record<string, unknown>) => {
          const guest = b.guest as { full_name: string; phone: string } | null;
          return guest ? { name: guest.full_name, phone: guest.phone } : null;
        })
        .filter((r): r is { name: string; phone: string } => r !== null && !!r.phone);

    } else if (segment === "checking_out_today") {
      const { data } = await supabase
        .from("bookings")
        .select("guest:guests(full_name, phone)")
        .eq("check_out", today)
        .eq("status", "CHECKED_IN");
      recipients = (data || [])
        .map((b: Record<string, unknown>) => {
          const guest = b.guest as { full_name: string; phone: string } | null;
          return guest ? { name: guest.full_name, phone: guest.phone } : null;
        })
        .filter((r): r is { name: string; phone: string } => r !== null && !!r.phone);

    } else if (segment === "checking_out_tomorrow") {
      const { data } = await supabase
        .from("bookings")
        .select("guest:guests(full_name, phone)")
        .eq("check_out", tomorrow)
        .eq("status", "CHECKED_IN");
      recipients = (data || [])
        .map((b: Record<string, unknown>) => {
          const guest = b.guest as { full_name: string; phone: string } | null;
          return guest ? { name: guest.full_name, phone: guest.phone } : null;
        })
        .filter((r): r is { name: string; phone: string } => r !== null && !!r.phone);

    } else if (segment === "past_guests") {
      const { data } = await supabase
        .from("bookings")
        .select("guest:guests(full_name, phone)")
        .eq("status", "CHECKED_OUT");
      recipients = (data || [])
        .map((b: Record<string, unknown>) => {
          const guest = b.guest as { full_name: string; phone: string } | null;
          return guest ? { name: guest.full_name, phone: guest.phone } : null;
        })
        .filter((r): r is { name: string; phone: string } => r !== null && !!r.phone);

    } else if (segment === "employees") {
      const { data } = await supabase.from("profiles").select("full_name, phone").eq("is_active", true).not("phone", "is", null);
      recipients = (data || []).map((p) => ({ name: p.full_name, phone: p.phone })).filter((r) => r.phone);
    }

    // Deduplicate by phone
    const seen = new Set<string>();
    const unique = recipients.filter((r) => {
      const key = r.phone.replace(/\D/g, "").slice(-9);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ recipients: unique, count: unique.length });
  } catch (error) {
    console.error("Recipients GET error:", error);
    return NextResponse.json({ error: "Failed to fetch recipients" }, { status: 500 });
  }
}
