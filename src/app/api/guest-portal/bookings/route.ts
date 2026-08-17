import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get("phone");
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const normalized = phone.replace(/\D/g, "");
    const last9 = normalized.slice(-9);

    const { data: guests } = await supabase
      .from("guests")
      .select("id")
      .or(`phone.ilike.%${last9}`);

    if (!guests || guests.length === 0) {
      return NextResponse.json({ bookings: [] });
    }

    const guestIds = guests.map((g) => g.id);

    const { data: bookings } = await supabase
      .from("bookings")
      .select("*, guest:guests(full_name, phone, email), rooms:booking_rooms(room:rooms(number, type, building))")
      .in("guest_id", guestIds)
      .order("created_at", { ascending: false });

    const enriched = await Promise.all(
      (bookings || []).map(async (b) => {
        const { data: payments } = await supabase
          .from("payments")
          .select("amount, method, status, created_at, reference")
          .eq("booking_id", b.id)
          .order("created_at", { ascending: false });

        const { data: complaints } = await supabase
          .from("complaints")
          .select("id, subject, status, category, created_at, resolution, resolved_at")
          .eq("booking_id", b.id)
          .order("created_at", { ascending: false });

        return {
          id: b.id,
          reference: b.reference,
          check_in: b.check_in,
          check_out: b.check_out,
          nights: b.nights,
          total_amount: b.total_amount,
          paid_amount: b.paid_amount,
          balance: b.balance,
          status: b.status,
          payment_status: b.payment_status,
          booking_type: b.booking_type,
          special_requests: b.special_requests,
          created_at: b.created_at,
          guest: b.guest,
          rooms: b.rooms || [],
          payments: payments || [],
          complaints: complaints || [],
        };
      }),
    );

    return NextResponse.json({ bookings: enriched });
  } catch (error) {
    console.error("Guest bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
