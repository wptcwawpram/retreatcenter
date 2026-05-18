import { NextRequest, NextResponse } from "next/server";
import { initializePayment } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, amount, bookingReference, guestName } = body;

    if (!email || !amount || !bookingReference) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const reference = `PAY-${bookingReference}-${Date.now()}`;
    const callbackUrl = `${request.nextUrl.origin}/booking/payment-callback`;

    const result = await initializePayment({
      email,
      amount: Math.round(amount * 100), // Convert GHS to pesewas
      reference,
      callbackUrl,
      metadata: {
        booking_reference: bookingReference,
        guest_name: guestName,
        custom_fields: [
          {
            display_name: "Booking Reference",
            variable_name: "booking_ref",
            value: bookingReference,
          },
          {
            display_name: "Guest Name",
            variable_name: "guest_name",
            value: guestName,
          },
        ],
      },
    });

    return NextResponse.json({
      authorization_url: result.data.authorization_url,
      reference: result.data.reference,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 },
    );
  }
}
