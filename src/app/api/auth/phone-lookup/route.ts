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

    const normalized = phone.replace(/\D/g, "");
    const last9 = normalized.slice(-9);

    const supabase = createServiceClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email")
      .or(`phone.ilike.%${last9}`)
      .limit(1)
      .maybeSingle();

    if (!profile?.email) {
      return NextResponse.json({ error: "No staff account found with this phone number" }, { status: 404 });
    }

    return NextResponse.json({ email: profile.email });
  } catch (error) {
    console.error("Phone lookup error:", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
