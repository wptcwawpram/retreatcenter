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

    const tempEmail = `staff_${last9}@wptc.local`;
    const tempPassword = `WPTC_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const phoneFormatted = normalized.startsWith("233") ? `+${normalized}` : `+233${last9}`;

    // Check if auth user already exists (from a previous failed attempt)
    const { data: existingUsers } = await supabase.auth.admin.listUsers({ perPage: 1, page: 1 });
    let authUserId: string;

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name, phone },
    });

    if (authError) {
      if (authError.message?.includes("already") || authError.message?.includes("exists") || authError.message?.includes("registered")) {
        // Auth user exists from a previous attempt — look them up by email
        const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 50, page: 1 });
        const found = listData?.users?.find((u) => u.email === tempEmail);
        if (!found) {
          return NextResponse.json({ error: `Auth conflict: ${authError.message}. Try a different phone number.` }, { status: 400 });
        }
        authUserId = found.id;
      } else {
        return NextResponse.json({ error: authError.message || "Failed to create auth user" }, { status: 500 });
      }
    } else {
      authUserId = authData.user.id;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: authUserId,
        email: tempEmail,
        full_name,
        phone: phoneFormatted,
        role: role || "receptionist",
        is_active: true,
      });

    if (profileError) {
      return NextResponse.json({ error: `Profile creation failed: ${profileError.message}` }, { status: 500 });
    }

    // Send SMS invite via Hubtel (non-fatal)
    try {
      const smsUrl = new URL("https://smsc.hubtel.com/v1/messages/send");
      smsUrl.searchParams.set("From", "WPTC");
      smsUrl.searchParams.set("To", phoneFormatted);
      smsUrl.searchParams.set("Content", `Hi ${full_name.split(" ")[0]}, you've been added as staff at Warriors Prayer Tower Complex. Open the app and log in with your phone number to set up your account.`);

      await fetch(smsUrl.toString(), {
        headers: { Authorization: `Basic ${Buffer.from(`${process.env.HUBTEL_CLIENT_ID}:${process.env.HUBTEL_CLIENT_SECRET}`).toString("base64")}` },
      });
    } catch {
      // SMS failure is non-fatal
    }

    return NextResponse.json({
      success: true,
      employee: { id: authUserId, full_name, phone: phoneFormatted, role: role || "receptionist" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Employee creation error:", msg, error);
    return NextResponse.json({ error: `Failed to create employee: ${msg}` }, { status: 500 });
  }
}
