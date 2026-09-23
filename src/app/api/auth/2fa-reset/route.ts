import { NextResponse } from "next/server";
import { TWOFA_COOKIE } from "@/lib/twofa";

// Clears the 2FA-verified cookie. Called on logout and at the start of a fresh
// password login so 2FA must be completed again.
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(TWOFA_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
