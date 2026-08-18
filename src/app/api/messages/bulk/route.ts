import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sendSms } from "@/lib/hubtel-sms";

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

function serviceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { recipients, message, subject } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: "No recipients provided" }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const supabase = serviceClient();
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const r of recipients) {
      const phone = r.phone || r;
      const name = r.name || null;

      if (!phone || typeof phone !== "string") {
        failed++;
        continue;
      }

      // Personalize message
      const personalizedMsg = name
        ? message.replace(/\{guest\}/gi, name).replace(/\{name\}/gi, name)
        : message.replace(/\{guest\}/gi, "Guest").replace(/\{name\}/gi, "Guest");

      let status = "SENT";
      let smsError: string | null = null;
      try {
        await sendSms({ to: phone, message: personalizedMsg });
        sent++;
      } catch (err) {
        status = "FAILED";
        smsError = err instanceof Error ? err.message : "SMS send failed";
        failed++;
        errors.push(`${phone}: ${smsError}`);
      }

      // Log each message
      try {
        await supabase.from("messages").insert({
          to_phone: phone,
          recipient_name: name,
          channel: "SMS",
          subject: subject || "Bulk Message",
          body: personalizedMsg,
          status,
          error: smsError,
          sent_by: user.id,
        });
      } catch {}

      // Small delay between sends to avoid rate limiting
      if (recipients.indexOf(r) < recipients.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    return NextResponse.json({
      success: true,
      total: recipients.length,
      sent,
      failed,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    console.error("Bulk message error:", error);
    return NextResponse.json({ error: "Failed to send bulk messages" }, { status: 500 });
  }
}
