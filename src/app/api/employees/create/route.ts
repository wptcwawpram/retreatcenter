import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
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

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { full_name, phone, role } = await request.json();

    if (!full_name || !phone) {
      return NextResponse.json({ error: "Name and phone number are required" }, { status: 400 });
    }

    const normalized = phone.replace(/\D/g, "");
    const last9 = normalized.slice(-9);

    const supabase = serviceClient();

    // Check if phone already exists
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .or(`phone.ilike.%${last9}`)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "An employee with this phone number already exists" }, { status: 400 });
    }

    // Create a temporary email from phone (employee will use phone to log in)
    const tempEmail = `staff_${last9}@wptc.local`;
    const tempPassword = `WPTC_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name, phone },
    });

    if (authError) throw authError;

    // Create profile
    const phoneFormatted = normalized.startsWith("233") ? `+${normalized}` : `+233${last9}`;
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: authData.user.id,
        email: tempEmail,
        full_name,
        phone: phoneFormatted,
        role: role || "receptionist",
        is_active: true,
        needs_onboarding: true,
      });

    if (profileError) throw profileError;

    // Send SMS invite via Hubtel
    try {
      const smsRes = await fetch("https://smsc.hubtel.com/v1/messages/send", {
        method: "GET",
        headers: { Authorization: `Basic ${Buffer.from(`${process.env.HUBTEL_CLIENT_ID}:${process.env.HUBTEL_CLIENT_SECRET}`).toString("base64")}` },
      });
      // Build SMS URL with params
      const smsUrl = new URL("https://smsc.hubtel.com/v1/messages/send");
      smsUrl.searchParams.set("From", "WPTC");
      smsUrl.searchParams.set("To", phoneFormatted);
      smsUrl.searchParams.set("Content", `Hi ${full_name.split(" ")[0]}, you've been added as staff at Warriors Prayer Tower Complex. Open the app and log in with your phone number to set up your account.`);

      await fetch(smsUrl.toString(), {
        headers: { Authorization: `Basic ${Buffer.from(`${process.env.HUBTEL_CLIENT_ID}:${process.env.HUBTEL_CLIENT_SECRET}`).toString("base64")}` },
      });
    } catch {
      // SMS send failure is non-fatal
    }

    return NextResponse.json({
      success: true,
      employee: { id: authData.user.id, full_name, phone: phoneFormatted, role: role || "receptionist" },
    });
  } catch (error) {
    console.error("Employee creation error:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
