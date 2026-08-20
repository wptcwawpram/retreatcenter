import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendSms } from "@/lib/hubtel-sms";
import { storeOTP, verifyOTP } from "@/lib/otp";
import { renderMessage } from "@/lib/message-templates";

function serviceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const supabase = serviceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, phone, avatar_url, invite_token")
    .eq("invite_token", token)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Invalid or expired invitation link" }, { status: 404 });
  }

  return NextResponse.json({
    id: profile.id,
    full_name: profile.full_name,
    role: profile.role,
    phone: profile.phone ? profile.phone.replace(/(\+233)(\d{2})\d{4}(\d{3})/, "$1$2****$3") : null,
    avatar_url: profile.avatar_url || null,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { action, token, code, password } = await request.json();
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const supabase = serviceClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, phone, invite_token")
      .eq("invite_token", token)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "Invalid or expired invitation link" }, { status: 404 });
    }

    if (action === "send_otp") {
      if (!profile.phone) {
        return NextResponse.json({ error: "No phone number on file" }, { status: 400 });
      }
      const otpCode = await storeOTP(profile.id, "guest_login");
      const otpMsg = await renderMessage("msg_otp_onboard", { code: otpCode });
      await sendSms({ to: profile.phone, message: otpMsg });
      const masked = profile.phone.replace(/(\+233)(\d{2})\d{4}(\d{3})/, "$1$2****$3");
      return NextResponse.json({ sent: true, masked });
    }

    if (action === "verify_otp") {
      if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 });
      const result = await verifyOTP(profile.id, code, "guest_login");
      if (!result.valid) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ verified: true });
    }

    if (action === "set_password") {
      if (!password) return NextResponse.json({ error: "Password is required" }, { status: 400 });

      if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
        return NextResponse.json({ error: "Password does not meet requirements" }, { status: 400 });
      }

      const { error: updateError } = await supabase.auth.admin.updateUserById(profile.id, {
        password,
      });

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      await supabase
        .from("profiles")
        .update({ invite_token: null })
        .eq("id", profile.id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Onboard error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
