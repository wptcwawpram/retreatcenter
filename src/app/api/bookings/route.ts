import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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
    const { guest, booking, source: bookingSource } = body;

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

    // 2. Create booking (NO SMS here — SMS is sent only after payment succeeds)
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
        source: bookingSource || "WEBSITE",
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

    // 4. Initialize Paystack payment so frontend can open inline popup
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    let paymentAccessCode: string | null = null;
    let paymentReference: string | null = null;

    const depositAmount = Math.ceil(totalAmount * 0.3);
    if (paystackKey && depositAmount > 0 && guest.email) {
      try {
        const payRef = `PAY-${bookingRecord.reference}-${Date.now()}`;
        const origin = request.nextUrl.origin;
        const payRes = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${paystackKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: guest.email,
            amount: Math.round(depositAmount * 100), // pesewas
            reference: payRef,
            callback_url: `${origin}/booking/payment-callback`,
            currency: "GHS",
            metadata: {
              booking_reference: bookingRecord.reference,
              guest_name: guest.full_name,
              guest_phone: guest.phone,
              check_in: booking.check_in,
              check_out: booking.check_out,
              custom_fields: [
                { display_name: "Booking Reference", variable_name: "booking_ref", value: bookingRecord.reference },
                { display_name: "Guest Name", variable_name: "guest_name", value: guest.full_name },
              ],
            },
          }),
        });
        const payData = await payRes.json();
        if (payData.status && payData.data) {
          paymentAccessCode = payData.data.access_code;
          paymentReference = payData.data.reference;
        }
      } catch (payError) {
        console.error("Paystack init failed (non-blocking):", payError);
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: bookingRecord.id,
        reference: bookingRecord.reference,
        total_amount: totalAmount,
        deposit: depositAmount,
      },
      payment: paymentAccessCode
        ? { access_code: paymentAccessCode, reference: paymentReference }
        : null,
    });
  } catch (error: unknown) {
    console.error("Booking creation error:", error);
    const message = error instanceof Error ? error.message : "Failed to create booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
