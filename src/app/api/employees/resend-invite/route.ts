import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sendSms } from "@/lib/hubtel-sms";
import { renderMessage } from "@/lib/message-templates";
import crypto from "crypto";

function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

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

    const inviteLink = `${getAppUrl()}/onboard?token=${inviteToken}`;

    const inviteMsg = await renderMessage("msg_staff_invite", { first_name: profile.full_name.split(" ")[0], link: inviteLink });
    await sendSms({ to: profile.phone, message: inviteMsg });

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Resend invite error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
