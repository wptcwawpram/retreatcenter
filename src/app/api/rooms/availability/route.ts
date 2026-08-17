import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

/**
 * GET /api/rooms/availability?check_in=2026-01-01&check_out=2026-01-03
 * Returns available rooms for the given date range
 */
export async function GET(request: NextRequest) {
  try {
    const checkIn = request.nextUrl.searchParams.get("check_in");
    const checkOut = request.nextUrl.searchParams.get("check_out");

    if (!checkIn || !checkOut) {
      return NextResponse.json({ error: "check_in and check_out are required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Get all rooms
    const { data: allRooms, error: roomsError } = await supabase
      .from("rooms")
      .select("id, number, name, type, building, capacity, price_per_night, status, has_ac")
      .in("status", ["AVAILABLE", "RESERVED", "CLEANING", "OCCUPIED"]) // Exclude only MAINTENANCE/BLOCKED
      .order("number");

    if (roomsError) throw roomsError;

    // Get bookings that overlap with the requested dates
    const { data: overlapping, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, room_ids")
      .lt("check_in", checkOut)
      .gt("check_out", checkIn)
      .in("status", ["PENDING", "CONFIRMED", "CHECKED_IN"]);

    if (bookingsError) throw bookingsError;

    // Collect all booked room IDs from room_ids array
    const bookedRoomIds = new Set<string>();
    (overlapping || []).forEach((booking) => {
      (booking.room_ids || []).forEach((id: string) => bookedRoomIds.add(id));
    });

    // Also check booking_rooms junction table for rooms assigned at check-in
    const overlappingIds = (overlapping || []).map((b) => b.id).filter(Boolean);
    if (overlappingIds.length > 0) {
      const { data: junctionRooms } = await supabase
        .from("booking_rooms")
        .select("room_id")
        .in("booking_id", overlappingIds);
      (junctionRooms || []).forEach((jr) => bookedRoomIds.add(jr.room_id));
    }

    // Filter out booked rooms
    const available = (allRooms || []).filter((r) => !bookedRoomIds.has(r.id));

    return NextResponse.json({
      available,
      total: allRooms?.length ?? 0,
      booked: bookedRoomIds.size,
    });
  } catch (error) {
    console.error("Availability check error:", error);
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 });
  }
}
