import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { storeOTP } from "@/lib/otp";
import { sendSms } from "@/lib/hubtel-sms";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function POST(request: NextRequest) {
  try {
    const { identifier, purpose, method } = await request.json();

    if (!identifier || !purpose) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const code = await storeOTP(identifier, purpose);

    if (purpose === "admin_2fa") {
      const supabase = createServiceClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone, full_name")
        .eq("id", identifier)
        .maybeSingle();

      if (method === "sms" && profile?.phone) {
        await sendSms({
          to: profile.phone,
          message: `WPTC Admin Login: Your verification code is ${code}. Valid for 5 minutes. Do not share this code.`,
        });
        const masked = profile.phone.replace(/(\d{3})\d{4}(\d{3})/, "$1****$2");
        return NextResponse.json({ sent: true, channel: "sms", masked });
      } else if (method === "email") {
        const { data: user } = await supabase.auth.admin.getUserById(identifier);
        if (user?.user?.email) {
          const resendKey = process.env.RESEND_API_KEY;
          if (resendKey) {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: process.env.RESEND_FROM_EMAIL || "WPTC <noreply@resend.dev>",
                to: [user.user.email],
                subject: "WPTC Admin Login Verification Code",
                html: `<div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:30px;background:#1a1a1a;color:#fff;border-radius:12px">
                  <h2 style="color:#d4af37;margin:0 0 20px">Verification Code</h2>
                  <p style="margin:0 0 15px;color:#ccc">Your login verification code is:</p>
                  <div style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:20px;background:#222;border-radius:8px;color:#d4af37">${code}</div>
                  <p style="margin:15px 0 0;color:#888;font-size:13px">Valid for 5 minutes. Do not share this code.</p>
                </div>`,
              }),
            });
          }
          const email = user.user.email;
          const masked = email.replace(/(.{2}).*(@.*)/, "$1***$2");
          return NextResponse.json({ sent: true, channel: "email", masked });
        }
      }

      if (profile?.phone) {
        await sendSms({
          to: profile.phone,
          message: `WPTC Admin Login: Your verification code is ${code}. Valid for 5 minutes. Do not share this code.`,
        });
        const masked = profile.phone.replace(/(\d{3})\d{4}(\d{3})/, "$1****$2");
        return NextResponse.json({ sent: true, channel: "sms", masked });
      }

      return NextResponse.json({ error: "No phone or email found for this account" }, { status: 400 });
    }

    if (purpose === "guest_login") {
      await sendSms({
        to: identifier,
        message: `WPTC Guest Portal: Your verification code is ${code}. Valid for 5 minutes.`,
      });
      const masked = identifier.replace(/(\d{3})\d{4}(\d{3})/, "$1****$2");
      return NextResponse.json({ sent: true, channel: "sms", masked });
    }

    return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
  }
}
