import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendSms } from "@/lib/hubtel-sms";
import { notifyAdmin } from "@/lib/notify-admin";
import { renderMessage } from "@/lib/message-templates";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function POST(request: NextRequest) {
  try {
    const { booking_id, action, room_ids } = await request.json();

    if (!booking_id || !action) {
      return NextResponse.json({ error: "Missing booking_id or action" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*, guest:guests(*)")
      .eq("id", booking_id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (action === "checkin") {
      if (!["CONFIRMED", "PENDING"].includes(booking.status)) {
        return NextResponse.json({ error: `Cannot check in a booking with status: ${booking.status}` }, { status: 400 });
      }

      await supabase
        .from("bookings")
        .update({ status: "CHECKED_IN", checked_in_at: new Date().toISOString() })
        .eq("id", booking_id);

      if (room_ids && room_ids.length > 0) {
        await supabase
          .from("rooms")
          .update({ status: "OCCUPIED" })
          .in("id", room_ids);

        const existingRooms = await supabase
          .from("booking_rooms")
          .select("room_id")
          .eq("booking_id", booking_id);

        const existingIds = new Set((existingRooms.data || []).map((r) => r.room_id));
        const newRoomIds = room_ids.filter((id: string) => !existingIds.has(id));

        if (newRoomIds.length > 0) {
          await supabase.from("booking_rooms").insert(
            newRoomIds.map((room_id: string) => ({ booking_id, room_id })),
          );
        }
      }

      const guest = booking.guest;
      if (guest?.phone) {
        const checkOutFmt = new Date(booking.check_out).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        const balanceNote = booking.balance > 0 ? `Outstanding balance: GH₵${booking.balance}. ` : "";
        renderMessage("msg_checkin_welcome", { guest_name: guest.full_name, check_out: checkOutFmt, balance_note: balanceNote })
          .then((msg) => sendSms({ to: guest.phone, message: msg }))
          .catch((err) => console.error("Check-in SMS failed:", err));
      }

      notifyAdmin({
        type: "booking",
        subject: `Check-in: ${booking.reference}`,
        message: `${guest?.full_name || "Guest"} has been checked in for booking ${booking.reference}.`,
      }).catch(() => {});

      return NextResponse.json({ success: true, status: "CHECKED_IN" });
    }

    if (action === "checkout") {
      if (booking.status !== "CHECKED_IN") {
        return NextResponse.json({ error: `Cannot check out a booking with status: ${booking.status}` }, { status: 400 });
      }

      await supabase
        .from("bookings")
        .update({ status: "CHECKED_OUT", checked_out_at: new Date().toISOString() })
        .eq("id", booking_id);

      const { data: bookingRooms } = await supabase
        .from("booking_rooms")
        .select("room_id")
        .eq("booking_id", booking_id);

      if (bookingRooms && bookingRooms.length > 0) {
        const roomIds = bookingRooms.map((r) => r.room_id);
        await supabase
          .from("rooms")
          .update({ status: "CLEANING" })
          .in("id", roomIds);
      }

      const guest = booking.guest;
      if (guest?.phone) {
        const balanceNote = booking.balance > 0 ? `Please note your outstanding balance of GH₵${booking.balance}. ` : "";
        renderMessage("msg_checkout_farewell", { guest_name: guest.full_name, balance_note: balanceNote })
          .then((msg) => sendSms({ to: guest.phone, message: msg }))
          .catch((err) => console.error("Check-out SMS failed:", err));
      }

      notifyAdmin({
        type: "booking",
        subject: `Check-out: ${booking.reference}`,
        message: `${guest?.full_name || "Guest"} has checked out from booking ${booking.reference}.${booking.balance > 0 ? ` Outstanding balance: GH₵${booking.balance}.` : ""}`,
      }).catch(() => {});

      return NextResponse.json({ success: true, status: "CHECKED_OUT" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Check-in/out error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
