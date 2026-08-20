import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { notifyAdmin } from "@/lib/notify-admin";
import { sendSms } from "@/lib/hubtel-sms";
import { renderMessage } from "@/lib/message-templates";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

/**
 * POST /api/guest-portal/complaint
 * Submit a complaint from the guest portal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, booking_reference, guest_phone, category, subject, description } = body;

    if (!subject || !description) {
      return NextResponse.json({ error: "Subject and description are required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Find guest ID and name from booking
    let guestId: string | null = null;
    let guestName = "A guest";
    let guestPhone = guest_phone || "";
    if (booking_reference) {
      const { data: booking } = await supabase
        .from("bookings")
        .select("guest_id, reference, guest:guests(full_name, phone)")
        .eq("reference", booking_reference)
        .maybeSingle();
      if (booking) {
        guestId = booking.guest_id;
        const guestArr = booking.guest as unknown as { full_name: string; phone: string }[] | null;
        const guest = Array.isArray(guestArr) ? guestArr[0] : guestArr;
        if (guest) {
          guestName = guest.full_name;
          guestPhone = guestPhone || guest.phone;
        }
      }
    }

    const { data, error } = await supabase
      .from("complaints")
      .insert({
        booking_id: booking_id || null,
        guest_id: guestId,
        room_id: null,
        category: category || "OTHER",
        subject,
        description,
        status: "OPEN",
        priority: "NORMAL",
        resolved_by: null,
        resolution: null,
      })
      .select()
      .single();

    if (error) throw error;

    // Notify admin about the complaint
    notifyAdmin({
      type: "complaint",
      subject: `New Complaint: ${subject}`,
      message: `${guestName} lodged a complaint.\nCategory: ${category || "OTHER"}\nSubject: ${subject}\nDetails: ${description}${booking_reference ? `\nBooking: ${booking_reference}` : ""}`,
    }).catch(() => {});

    // Send confirmation SMS to guest
    if (guestPhone) {
      renderMessage("msg_complaint_received", { subject }).then((msg) =>
        sendSms({ to: guestPhone, message: msg })
      ).catch(() => {});
    }

    return NextResponse.json({ success: true, complaint_id: data.id });
  } catch (error) {
    console.error("Guest complaint error:", error);
    return NextResponse.json({ error: "Failed to submit complaint" }, { status: 500 });
  }
}
