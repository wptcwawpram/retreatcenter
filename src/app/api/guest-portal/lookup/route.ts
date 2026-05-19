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
 * GET /api/guest-portal/lookup?reference=WPTC-XXXX&phone=+233XXXXXXXXX
 * Lookup a booking by reference + phone for guest portal access
 */
export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get("reference");
    const phone = request.nextUrl.searchParams.get("phone");

    if (!reference || !phone) {
      return NextResponse.json({ error: "Reference and phone number are required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Normalize phone: strip spaces, ensure starts with +233 or 0
    const normalizedPhone = phone.replace(/\s/g, "");

    // Find booking by reference
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("*, guest:guests(*)")
      .eq("reference", reference.toUpperCase())
      .maybeSingle();

    if (error) throw error;
    if (!booking) {
      return NextResponse.json({ error: "No booking found with that reference" }, { status: 404 });
    }

    // Verify phone matches guest
    const guestPhone = booking.guest?.phone?.replace(/\s/g, "") || "";
    const phoneMatch =
      guestPhone === normalizedPhone ||
      guestPhone.endsWith(normalizedPhone.slice(-9)) ||
      normalizedPhone.endsWith(guestPhone.slice(-9));

    if (!phoneMatch) {
      return NextResponse.json({ error: "Phone number does not match this booking" }, { status: 403 });
    }

    // Get payment history for this booking
    const { data: payments } = await supabase
      .from("payments")
      .select("amount, method, status, created_at, reference")
      .eq("booking_id", booking.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      booking: {
        id: booking.id,
        reference: booking.reference,
        check_in: booking.check_in,
        check_out: booking.check_out,
        nights: booking.nights,
        total_amount: booking.total_amount,
        paid_amount: booking.paid_amount,
        balance: booking.balance,
        status: booking.status,
        payment_status: booking.payment_status,
        booking_type: booking.booking_type,
        special_requests: booking.special_requests,
        created_at: booking.created_at,
        guest: {
          full_name: booking.guest?.full_name,
          phone: booking.guest?.phone,
          email: booking.guest?.email,
        },
        payments: payments || [],
      },
    });
  } catch (error) {
    console.error("Guest portal lookup error:", error);
    return NextResponse.json({ error: "Failed to lookup booking" }, { status: 500 });
  }
}
