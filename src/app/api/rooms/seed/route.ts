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
  })),
  // Main Building: 4-in-1 (rooms 6-13)
  ...Array.from({ length: 8 }, (_, i) => ({
    number: String(i + 6),
    name: `Room ${i + 6}`,
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
  })),
  // Holy Family: Room 1 (2-in-1)
  {
    number: "HF-1",
    name: "Holy Family Room 1",
    type: "2_IN_1" as const,
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
  },
  // Holy Family: Room 2 (2-in-1)
  {
    number: "HF-2",
    name: "Holy Family Room 2",
    type: "2_IN_1" as const,
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
  },
  // Holy Family: Room 3 (3-in-1)
  {
    number: "HF-3",
    name: "Holy Family Room 3",
    type: "3_IN_1" as const,
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
  },
];

export async function POST() {
  try {
    const auth = await createAuthClient();
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createServiceClient();

    // Check if rooms already exist
    const { data: existing } = await supabase.from("rooms").select("id").limit(1);
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "Rooms already exist. Delete existing rooms first if you want to re-seed." }, { status: 400 });
    }

    const { data, error } = await supabase.from("rooms").insert(SEED_ROOMS).select();
    if (error) throw error;

    return NextResponse.json({ success: true, count: data.length });
  } catch (error) {
    console.error("Room seed error:", error);
    return NextResponse.json({ error: "Failed to seed rooms" }, { status: 500 });
  }
}
