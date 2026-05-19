import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

/**
 * POST /api/guest-portal/complaint
 * Submit a complaint from the guest portal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, booking_reference, guest_phone, category, subject, description } = body;

    if (!subject || !description) {
      return NextResponse.json({ error: "Subject and description are required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Find guest ID from booking
    let guestId: string | null = null;
    if (booking_reference && guest_phone) {
      const { data: booking } = await supabase
        .from("bookings")
        .select("guest_id")
        .eq("reference", booking_reference)
        .maybeSingle();
      if (booking) guestId = booking.guest_id;
    }

    const { data, error } = await supabase
      .from("complaints")
      .insert({
        booking_id: booking_id || null,
        guest_id: guestId,
        room_id: null,
        category: category || "OTHER",
        subject,
        description,
        status: "OPEN",
        priority: "NORMAL",
        resolved_by: null,
        resolution: null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, complaint_id: data.id });
  } catch (error) {
    console.error("Guest complaint error:", error);
    return NextResponse.json({ error: "Failed to submit complaint" }, { status: 500 });
  }
}
