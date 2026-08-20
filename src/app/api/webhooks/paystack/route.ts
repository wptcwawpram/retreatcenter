import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, verifyPayment } from "@/lib/paystack";
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";

    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const { reference } = event.data;

      // Verify the transaction with Paystack
      const verification = await verifyPayment(reference);

      if (verification.data.status === "success") {
        const amountPaid = verification.data.amount / 100;
        const metadata = verification.data.metadata as Record<string, string> | undefined;
        const bookingRef = metadata?.booking_reference;
        const guestName = metadata?.guest_name;
        const guestPhone = metadata?.guest_phone;
        const checkIn = metadata?.check_in;
        const checkOut = metadata?.check_out;

        if (bookingRef) {
          const supabase = createServiceClient();

          // Get the booking
          const { data: booking } = await supabase
            .from("bookings")
            .select("id, total_amount, paid_amount, payment_status")
            .eq("reference", bookingRef)
            .maybeSingle();

          if (booking && booking.payment_status !== "PAID") {
            const newPaid = Number(booking.paid_amount) + amountPaid;
            const remaining = Math.max(0, Number(booking.total_amount) - newPaid);
            const paymentStatus = remaining <= 0 ? "PAID" : "PARTIAL";

            // Update booking
            await supabase
              .from("bookings")
              .update({
                paid_amount: newPaid,
                balance: remaining,
                payment_status: paymentStatus,
                status: "CONFIRMED",
              })
              .eq("id", booking.id);

            // Record payment
            await supabase.from("payments").insert({
              booking_id: booking.id,
              amount: amountPaid,
              method: "PAYSTACK",
              status: "COMPLETED",
              reference: verification.data.reference,
              notes: `Paystack webhook payment via ${verification.data.channel}`,
            });

            // Record in finance
            try {
              await supabase.from("finance_records").insert({
                type: "INCOME",
                category: "Booking Payment",
                description: `Paystack payment for booking ${bookingRef}${guestName ? ` — ${guestName}` : ""}`,
                amount: amountPaid,
                date: new Date().toISOString().split("T")[0],
                booking_id: booking.id,
              });
            } catch {}

            // Notify admin of payment
            notifyAdmin({
              type: "payment",
              subject: `Payment Received: ${bookingRef}`,
              message: `${guestName || "Guest"} paid GH₵${amountPaid} for booking ${bookingRef}. Status: ${paymentStatus}.`,
            }).catch(() => {});

            // Send confirmation SMS
            try {
              if (guestPhone && guestName && checkIn && checkOut) {
                const checkInFmt = new Date(checkIn).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                const checkOutFmt = new Date(checkOut).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                const confirmMsg = await renderMessage("msg_booking_confirmation", { guest_name: guestName, reference: bookingRef, check_in: checkInFmt, check_out: checkOutFmt });
                await sendSms({ to: guestPhone, message: confirmMsg });
              }
            } catch (smsErr) {
              console.error("Webhook SMS failed:", smsErr);
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
