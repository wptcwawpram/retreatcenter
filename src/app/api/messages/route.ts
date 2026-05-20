import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sendSms } from "@/lib/hubtel-sms";

async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
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
}

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

/**
 * GET /api/messages — fetch message history
 */
export async function GET() {
  try {
    const auth = await createAuthClient();
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;

    return NextResponse.json({ messages: data });
  } catch (error) {
    console.error("Messages GET error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

/**
 * POST /api/messages — send an SMS and log it
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await createAuthClient();
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { to, recipient_name, subject, message } = body;

    if (!to || !message) {
      return NextResponse.json({ error: "Phone number and message are required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Try to send SMS
    let status = "SENT";
    let smsError: string | null = null;
    try {
      await sendSms({ to, message });
    } catch (err) {
      status = "FAILED";
      smsError = err instanceof Error ? err.message : "SMS send failed";
    }

    // Log message in DB regardless
    const { data, error } = await supabase
      .from("messages")
      .insert({
        to_phone: to,
        recipient_name: recipient_name || null,
        channel: "SMS",
        subject: subject || null,
        body: message,
        status,
        error: smsError,
        sent_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    if (status === "FAILED") {
      return NextResponse.json({ success: false, error: smsError, message_id: data.id }, { status: 200 });
    }

    return NextResponse.json({ success: true, message_id: data.id });
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
