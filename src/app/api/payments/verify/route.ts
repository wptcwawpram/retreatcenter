import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/paystack";
import { createServerClient } from "@supabase/ssr";
import { sendSms } from "@/lib/hubtel-sms";
import { notifyAdmin } from "@/lib/notify-admin";
import { renderMessage } from "@/lib/message-templates";

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

        // Fetch booking to get current paid amount and total
        const { data: bookingRecord } = await supabase
          .from("bookings")
          .select("id, total_amount, paid_amount")
          .eq("reference", bookingRef)
          .maybeSingle();

        if (bookingRecord) {
          const existingPaid = Number(bookingRecord.paid_amount) || 0;
          const totalPaid = existingPaid + amountPaid;
          const totalAmount = Number(bookingRecord.total_amount) || 0;
          const remaining = Math.max(0, totalAmount - totalPaid);
          const paymentStatus = totalPaid >= totalAmount && totalAmount > 0 ? "PAID" : totalPaid > 0 ? "PARTIAL" : "UNPAID";

          await supabase
            .from("bookings")
            .update({
              paid_amount: totalPaid,
              balance: remaining,
              payment_status: paymentStatus,
              status: "CONFIRMED",
            })
            .eq("id", bookingRecord.id);

          // Insert payment record
          await supabase.from("payments").insert({
            booking_id: bookingRecord.id,
            amount: amountPaid,
            method: "PAYSTACK",
            status: "COMPLETED",
            reference: result.data.reference,
            notes: `Paystack deposit payment via ${result.data.channel}`,
          });

          // Record in finance
          try {
            await supabase.from("finance_records").insert({
              type: "INCOME",
              category: "Booking Payment",
              description: `Paystack deposit for booking ${bookingRef}${guestName ? ` — ${guestName}` : ""}`,
              amount: amountPaid,
              date: new Date().toISOString().split("T")[0],
              booking_id: bookingRecord.id,
            });
          } catch {}
        }

        // Send confirmation SMS to guest
        try {
          if (guestPhone && guestName && checkIn && checkOut) {
            const checkInFormatted = new Date(checkIn).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
            const checkOutFormatted = new Date(checkOut).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
            const confirmMsg = await renderMessage("msg_booking_confirmation", { guest_name: guestName, reference: bookingRef, check_in: checkInFormatted, check_out: checkOutFormatted });
            await sendSms({ to: guestPhone, message: confirmMsg });
          }
        } catch (smsError) {
          console.error("Guest SMS failed:", smsError);
        }

        // Notify admin in-app
        notifyAdmin({
          type: "payment",
          subject: `Payment Received: ${bookingRef}`,
          message: `${guestName || "Guest"} paid GH₵${amountPaid} for booking ${bookingRef}.`,
        }).catch(() => {});
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
