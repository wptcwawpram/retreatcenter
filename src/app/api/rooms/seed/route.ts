import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

const SEED_ROOMS = [
  // Main Building: 2-in-1 (rooms 1-5)
  ...Array.from({ length: 5 }, (_, i) => ({
    number: String(i + 1),
    name: `Room ${i + 1}`,
    type: "2_IN_1" as const,
    building: "Main Building",
    floor: 0,
    capacity: 2,
    beds: 2,
    price_per_night: 150,
    status: "AVAILABLE" as const,
    amenities: ["Washroom", "Built-in Desk", "Seating Area"],
    has_ac: false,
    has_tv: false,
    has_fridge: false,
    description: null,
    display_order: i + 1,
  })),
  // Main Building: Room 6 (4-in-1)
  {
    number: "6",
    name: "Room 6",
    type: "4_IN_1" as const,
    building: "Main Building",
    floor: 0,
    capacity: 4,
    beds: 4,
    price_per_night: 200,
    status: "AVAILABLE" as const,
    amenities: ["Washroom", "Built-in Desk", "Seating Area"],
    has_ac: false,
    has_tv: false,
    has_fridge: false,
    description: null,
    display_order: 6,
  },
  // Suite 1 (between room 6 and 7)
  {
    number: "ST1",
    name: "Suite 1",
    type: "SUITE_AC" as const,
    building: "Main Building",
    floor: 0,
    capacity: 2,
    beds: 1,
    price_per_night: 500,
    status: "AVAILABLE" as const,
    amenities: ["Air Conditioning", "Private Washroom", "TV", "Fridge", "Seating Area"],
    has_ac: true,
    has_tv: true,
    has_fridge: true,
    description: "Premium suite with air conditioning and full amenities",
    display_order: 7,
  },
  // Suite 2
  {
    number: "ST2",
    name: "Suite 2",
    type: "SUITE_AC" as const,
    building: "Main Building",
    floor: 0,
    capacity: 2,
    beds: 1,
    price_per_night: 500,
    status: "AVAILABLE" as const,
    amenities: ["Air Conditioning", "Private Washroom", "TV", "Fridge", "Seating Area"],
    has_ac: true,
    has_tv: true,
    has_fridge: true,
    description: "Premium suite with air conditioning and full amenities",
    display_order: 8,
  },
  // Main Building: 4-in-1 (rooms 7-13)
  ...Array.from({ length: 7 }, (_, i) => ({
    number: String(i + 7),
    name: `Room ${i + 7}`,
    type: "4_IN_1" as const,
    building: "Main Building",
    floor: 0,
    capacity: 4,
    beds: 4,
    price_per_night: 200,
    status: "AVAILABLE" as const,
    amenities: ["Washroom", "Built-in Desk", "Seating Area"],
    has_ac: false,
    has_tv: false,
    has_fridge: false,
    description: null,
    display_order: 9 + i,
  })),
  // Main Building: 6-in-1 (rooms 14-21)
  ...Array.from({ length: 8 }, (_, i) => ({
    number: String(i + 14),
    name: `Room ${i + 14}`,
    type: "6_IN_1" as const,
    building: "Main Building",
    floor: 0,
    capacity: 6,
    beds: 6,
    price_per_night: 270,
    status: "AVAILABLE" as const,
    amenities: ["Washroom", "Built-in Desk", "Seating Area"],
    has_ac: false,
    has_tv: false,
    has_fridge: false,
    description: null,
    display_order: 16 + i,
  })),
  // Holy Family: Room 1 (2-in-1)
  {
    number: "HF1",
    name: "Holy Family Room 1",
    type: "APARTMENT" as const,
    building: "Holy Family",
    floor: 0,
    capacity: 2,
    beds: 2,
    price_per_night: 750,
    status: "AVAILABLE" as const,
    amenities: ["Air Conditioning", "Private Washroom", "Kitchen", "Fridge", "TV"],
    has_ac: true,
    has_tv: true,
    has_fridge: true,
    description: "Holy Family Apartment - 2-in-1 bedroom",
    display_order: 24,
  },
  // Holy Family: Room 2 (2-in-1)
  {
    number: "HF2",
    name: "Holy Family Room 2",
    type: "APARTMENT" as const,
    building: "Holy Family",
    floor: 0,
    capacity: 2,
    beds: 2,
    price_per_night: 750,
    status: "AVAILABLE" as const,
    amenities: ["Air Conditioning", "Private Washroom", "Kitchen", "Fridge", "TV"],
    has_ac: true,
    has_tv: true,
    has_fridge: true,
    description: "Holy Family Apartment - 2-in-1 bedroom",
    display_order: 25,
  },
  // Holy Family: Room 3 (3-in-1)
  {
    number: "HF3",
    name: "Holy Family Room 3",
    type: "APARTMENT" as const,
    building: "Holy Family",
    floor: 0,
    capacity: 3,
    beds: 3,
    price_per_night: 750,
    status: "AVAILABLE" as const,
    amenities: ["Air Conditioning", "Private Washroom", "Kitchen", "Fridge", "TV"],
    has_ac: true,
    has_tv: true,
    has_fridge: true,
    description: "Holy Family Apartment - 3-in-1 bedroom",
    display_order: 26,
  },
];

export async function POST(request: Request) {
  try {
    let authorized = false;

    // Check for setup secret (used by /setup page)
    try {
      const body = await request.clone().json();
      if (body?.secret === "WPTC-SETUP-2024") authorized = true;
    } catch {}

    // Otherwise check for logged-in user
    if (!authorized) {
      const auth = await createAuthClient();
      const { data: { user } } = await auth.auth.getUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Ensure display_order column exists
    try {
      await supabase.rpc("exec_sql", {
        query: "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS display_order integer;"
      });
    } catch {}

    // Try to clear existing rooms first (may fail if bookings reference them)
    const { error: delErr } = await supabase.from("rooms").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // Strip display_order if column doesn't exist (fallback)
    const insertRooms = (rooms: typeof SEED_ROOMS) => {
      return supabase.from("rooms").insert(rooms).select();
    };
    const insertRoomsFallback = (rooms: typeof SEED_ROOMS) => {
      const stripped = rooms.map(({ display_order: _, ...rest }) => rest);
      return supabase.from("rooms").insert(stripped).select();
    };

    if (delErr) {
      const { data: existing } = await supabase.from("rooms").select("number");
      const existingNumbers = new Set((existing ?? []).map((r: { number: string }) => r.number));
      const newRooms = SEED_ROOMS.filter((r) => !existingNumbers.has(r.number));

      if (newRooms.length > 0) {
        let result = await insertRooms(newRooms);
        if (result.error) result = await insertRoomsFallback(newRooms);
        if (result.error) throw result.error;
        return NextResponse.json({ success: true, count: result.data!.length, message: `Added ${result.data!.length} new rooms (${existingNumbers.size} already existed)` });
      }
      return NextResponse.json({ success: true, count: 0, message: `All ${existingNumbers.size} rooms already exist` });
    }

    let result = await insertRooms(SEED_ROOMS);
    if (result.error) result = await insertRoomsFallback(SEED_ROOMS);
    if (result.error) throw result.error;

    return NextResponse.json({ success: true, count: result.data!.length, message: `Seeded ${result.data!.length} rooms` });
  } catch (error) {
    console.error("Room seed error:", error);
    const msg = error instanceof Error ? error.message : (typeof error === "object" && error !== null ? JSON.stringify(error) : String(error));
    return NextResponse.json({ error: "Failed to seed rooms", details: msg }, { status: 500 });
  }
}
