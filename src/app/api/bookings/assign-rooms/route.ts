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
 * POST /api/bookings/assign-rooms
 * Assigns specific rooms to a booking (before or at check-in).
 *
 * Writes to BOTH stores so everything stays consistent:
 *  - bookings.room_ids (array)  — read by the calendar
 *  - booking_rooms (junction)   — read by check-in / check-out
 *
 * Body: { booking_id, room_ids: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { booking_id, room_ids } = await request.json();
    if (!booking_id) return NextResponse.json({ error: "booking_id is required" }, { status: 400 });

    const ids: string[] = Array.isArray(room_ids) ? room_ids.filter(Boolean) : [];
    const supabase = serviceClient();

    // 1. Keep the array column in sync (used by the calendar)
    const { error: updErr } = await supabase
      .from("bookings")
      .update({ room_ids: ids })
      .eq("id", booking_id);
    if (updErr) throw updErr;

    // 2. Rebuild the junction rows (used by check-in / check-out). Ignore if the
    //    table isn't present in this database.
    try {
      await supabase.from("booking_rooms").delete().eq("booking_id", booking_id);
      if (ids.length > 0) {
        await supabase.from("booking_rooms").insert(ids.map((room_id) => ({ booking_id, room_id })));
      }
    } catch (e) {
      console.error("booking_rooms sync skipped:", e);
    }

    return NextResponse.json({ success: true, room_ids: ids });
  } catch (error) {
    console.error("Assign rooms error:", error);
    const msg = error instanceof Error ? error.message : "Failed to assign rooms";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
