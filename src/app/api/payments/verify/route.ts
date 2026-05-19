import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/paystack";
import { createServerClient } from "@supabase/ssr";
import { sendSms, SMS_TEMPLATES } from "@/lib/hubtel-sms";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get("reference");
    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 },
      );
    }

    const result = await verifyPayment(reference);
    const amountPaid = result.data.amount / 100; // pesewas → GHS

    // On successful payment, update booking + send confirmation SMS
    if (result.data.status === "success") {
      const metadata = result.data.metadata as Record<string, string> | undefined;
      const bookingRef = metadata?.booking_reference;
      const guestName = metadata?.guest_name;
      const guestPhone = metadata?.guest_phone;
      const checkIn = metadata?.check_in;
      const checkOut = metadata?.check_out;

      if (bookingRef) {
        const supabase = createServiceClient();

        // Update booking payment status
        await supabase
          .from("bookings")
          .update({
            paid_amount: amountPaid,
            balance: 0, // Will be recalculated if needed
            payment_status: "DEPOSIT_PAID",
            status: "CONFIRMED",
          })
          .eq("reference", bookingRef);

        // Record the payment
        const { data: bookingRecord } = await supabase
          .from("bookings")
          .select("id, total_amount")
          .eq("reference", bookingRef)
          .maybeSingle();

        if (bookingRecord) {
          const remaining = Number(bookingRecord.total_amount) - amountPaid;
          await supabase
            .from("bookings")
            .update({ balance: Math.max(0, remaining) })
            .eq("id", bookingRecord.id);

          // Insert payment record
          await supabase.from("payments").insert({
            booking_id: bookingRecord.id,
            amount: amountPaid,
            method: "MOBILE_MONEY",
            status: "COMPLETED",
            reference: result.data.reference,
            notes: `Paystack deposit payment via ${result.data.channel}`,
          });
        }

        // Send confirmation SMS (only now, AFTER payment succeeds)
        try {
          if (guestPhone && guestName && checkIn && checkOut) {
            const checkInFormatted = new Date(checkIn).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
            const checkOutFormatted = new Date(checkOut).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
            await sendSms({
              to: guestPhone,
              message: SMS_TEMPLATES.bookingConfirmation(guestName, bookingRef, checkInFormatted, checkOutFormatted),
            });
          }
        } catch (smsError) {
          console.error("SMS send failed (non-blocking):", smsError);
        }
      }
    }

    return NextResponse.json({
      status: result.data.status,
      amount: amountPaid,
      reference: result.data.reference,
      booking_reference: (result.data.metadata as Record<string, string>)?.booking_reference || null,
      channel: result.data.channel,
      paid_at: result.data.paid_at,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 },
    );
  }
}
