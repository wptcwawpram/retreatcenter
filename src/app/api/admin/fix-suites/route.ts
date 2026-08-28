import { NextResponse } from "next/server";
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
 * POST /api/admin/fix-suites
 * One-time migration: sets ST1 to SUITE_FAN (GH₵350) and ST2 to SUITE_AC (GH₵750).
 */
export async function POST() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sb = serviceClient();

    const { error: e1 } = await sb
      .from("rooms")
      .update({ type: "SUITE_FAN", price_per_night: 350, has_ac: false, description: "Suite with fan, private washroom and full amenities", amenities: ["Ceiling Fan", "Private Washroom", "TV", "Fridge", "Seating Area"] })
      .eq("number", "ST1");

    const { error: e2 } = await sb
      .from("rooms")
      .update({ type: "SUITE_AC", price_per_night: 750, has_ac: true, description: "Premium suite with air conditioning and full amenities" })
      .eq("number", "ST2");

    if (e1 || e2) {
      return NextResponse.json({ error: "Partial failure", st1: e1?.message, st2: e2?.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "ST1 → SUITE_FAN (GH₵350), ST2 → SUITE_AC (GH₵750)" });
  } catch (error) {
    console.error("fix-suites error:", error);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}
