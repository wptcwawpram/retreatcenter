import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendSms, SMS_TEMPLATES } from "@/lib/hubtel-sms";

// Use service role key so public booking form can insert without auth
function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guest, booking } = body;

    if (!guest?.full_name || !guest?.phone || !booking?.check_in || !booking?.check_out) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // 1. Find or create guest
    let guestRecord;
    const { data: existing } = await supabase
      .from("guests")
      .select("*")
      .eq("phone", guest.phone)
      .maybeSingle();

    if (existing) {
      guestRecord = existing;
      // Update name/email if provided
      await supabase
        .from("guests")
        .update({ full_name: guest.full_name, email: guest.email || existing.email })
        .eq("id", existing.id);
    } else {
      const { data, error } = await supabase
        .from("guests")
        .insert({
          full_name: guest.full_name,
          email: guest.email || null,
          phone: guest.phone,
          id_type: guest.id_type || null,
          id_number: guest.id_number || null,
          nationality: guest.nationality || "Ghanaian",
        })
        .select()
        .single();
      if (error) throw error;
      guestRecord = data;
    }

    // 2. Create booking
    const totalAmount = Number(booking.total_amount) || 0;
    const { data: bookingRecord, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        guest_id: guestRecord.id,
        room_ids: booking.room_ids || [],
        check_in: booking.check_in,
        check_out: booking.check_out,
        nights: booking.nights || 1,
        adults: booking.adults || 1,
        children: booking.children || 0,
        total_amount: totalAmount,
        paid_amount: 0,
        balance: totalAmount,
        status: "PENDING",
        booking_type: booking.booking_type || "INDIVIDUAL",
        special_requests: booking.special_requests || null,
        hall_id: booking.hall_id || null,
        hall_days: booking.hall_days || 0,
        hall_amount: booking.hall_amount || 0,
        payment_status: "UNPAID",
        source: "WEBSITE",
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // 3. Create finance record for expected income
    await supabase.from("finance_records").insert({
      type: "INCOME",
      category: "Room Booking",
      description: `Website booking by ${guest.full_name} (${bookingRecord.reference})`,
      amount: totalAmount,
      date: new Date().toISOString().split("T")[0],
      booking_id: bookingRecord.id,
    });

    // 4. Send confirmation SMS (best effort)
    try {
      if (guest.phone) {
        const checkInFormatted = new Date(booking.check_in).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        const checkOutFormatted = new Date(booking.check_out).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        await sendSms({
          to: guest.phone,
          message: SMS_TEMPLATES.bookingConfirmation(guest.full_name, bookingRecord.reference, checkInFormatted, checkOutFormatted),
        });
      }
    } catch (smsError) {
      console.error("SMS send failed (non-blocking):", smsError);
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: bookingRecord.id,
        reference: bookingRecord.reference,
        total_amount: totalAmount,
        deposit: Math.ceil(totalAmount * 0.3),
      },
    });
  } catch (error: unknown) {
    console.error("Booking creation error:", error);
    const message = error instanceof Error ? error.message : "Failed to create booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
