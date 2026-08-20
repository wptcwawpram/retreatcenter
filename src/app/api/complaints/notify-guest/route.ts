import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sendSms } from "@/lib/hubtel-sms";
import { renderMessage } from "@/lib/message-templates";

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

/**
 * POST /api/complaints/notify-guest
 * Send an SMS update to the guest about their complaint
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { complaint_id, message } = await request.json();
    if (!complaint_id || !message) {
      return NextResponse.json({ error: "complaint_id and message are required" }, { status: 400 });
    }

    const supabase = serviceClient();

    // Get complaint with guest info
    const { data: complaint } = await supabase
      .from("complaints")
      .select("id, subject, guest_id, guest:guests(full_name, phone)")
      .eq("id", complaint_id)
      .maybeSingle();

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    const guestArr = complaint.guest as unknown as { full_name: string; phone: string }[] | null;
    const guest = Array.isArray(guestArr) ? guestArr[0] : guestArr;
    if (!guest?.phone) {
      return NextResponse.json({ error: "No phone number on file for this guest" }, { status: 400 });
    }

    const smsText = await renderMessage("msg_complaint_update", { subject: complaint.subject, message });
    await sendSms({ to: guest.phone, message: smsText });

    return NextResponse.json({ success: true, sent_to: guest.full_name });
  } catch (error) {
    console.error("Notify guest error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
