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
    const { phone, new_password } = await request.json();

    if (!phone || !new_password) {
      return NextResponse.json({ error: "Phone and new password are required" }, { status: 400 });
    }

    if (new_password.length < 8 || !/[A-Z]/.test(new_password) || !/\d/.test(new_password) || !/[^a-zA-Z0-9]/.test(new_password)) {
      return NextResponse.json({ error: "Password must be 8+ chars with uppercase, number, and symbol" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const normalized = phone.replace(/\D/g, "");
    const last9 = normalized.slice(-9);

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, phone")
      .or(`phone.ilike.%${last9}`)
      .limit(1)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "No staff account found with this phone number" }, { status: 404 });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(profile.id, {
      password: new_password,
    });

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: "Password reset failed" }, { status: 500 });
  }
}
