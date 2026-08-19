import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sendSms } from "@/lib/hubtel-sms";
import crypto from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c) => {
          try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { employeeId } = await request.json();
    if (!employeeId) return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } },
    );

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", employeeId)
      .maybeSingle();

    if (error || !profile) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    if (!profile.phone) {
      return NextResponse.json({ error: "Employee has no phone number" }, { status: 400 });
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");

    await supabase
      .from("profiles")
      .update({ invite_token: inviteToken })
      .eq("id", employeeId);

    const inviteLink = `${APP_URL}/onboard?token=${inviteToken}`;

    await sendSms({
      to: profile.phone,
      message: `Hi ${profile.full_name.split(" ")[0]}, you've been invited to join WPTC as staff. Click the link to set up your account: ${inviteLink}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Resend invite error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
