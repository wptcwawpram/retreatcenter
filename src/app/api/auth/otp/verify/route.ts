import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";
import { createTwofaToken, TWOFA_COOKIE } from "@/lib/twofa";

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

    const response = NextResponse.json({ verified: true });

    // Admin login 2FA: mark this browser session as 2FA-verified (session cookie)
    if (purpose === "admin_2fa") {
      const token = await createTwofaToken(identifier);
      response.cookies.set(TWOFA_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        // no maxAge => session cookie: cleared when the browser closes
      });
    }

    return response;
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
