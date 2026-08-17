import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const normalized = phone.replace(/\D/g, "");
    const last9 = normalized.slice(-9);

    const { data: guests } = await supabase
      .from("guests")
      .select("id, phone")
      .or(`phone.ilike.%${last9}`)
      .limit(1);

    if (!guests || guests.length === 0) {
      return NextResponse.json({ error: "No bookings found for this phone number. Please check and try again." }, { status: 404 });
    }

    return NextResponse.json({ found: true, guestId: guests[0].id });
  } catch (error) {
    console.error("Guest login error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
