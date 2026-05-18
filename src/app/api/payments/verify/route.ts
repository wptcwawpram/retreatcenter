import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/paystack";

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

    return NextResponse.json({
      status: result.data.status,
      amount: result.data.amount / 100,
      reference: result.data.reference,
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
