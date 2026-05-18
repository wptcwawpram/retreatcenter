import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, verifyPayment } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 },
      );
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const { reference, amount } = event.data;

      // Verify the transaction
      const verification = await verifyPayment(reference);

      if (verification.data.status === "success") {
        // TODO: Update payment record in Supabase
        // TODO: Update booking payment_status
        // TODO: Send SMS confirmation via Hubtel
        console.log(
          `Payment successful: ${reference}, Amount: GHS ${amount / 100}`,
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
