import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";

export async function POST(request: NextRequest) {
  try {
    const { identifier, code, purpose } = await request.json();

    if (!identifier || !code || !purpose) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await verifyOTP(identifier, code, purpose);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
