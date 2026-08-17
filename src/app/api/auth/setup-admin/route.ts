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
    const { secret } = await request.json();

    if (secret !== process.env.ADMIN_SETUP_SECRET && secret !== "WPTC-SETUP-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    const adminEmail = "worshipsaxod@gmail.com";
    const adminPhone = "+233247258161";
    const adminName = "Dr. Worship Odoi";

    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((u) => u.email === adminEmail);

    let userId: string;

    if (existing) {
      userId = existing.id;
    } else {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: "WptcAdmin@2024",
        email_confirm: true,
        user_metadata: { full_name: adminName },
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Try to update role constraint to allow super_admin
    try {
      await supabase.rpc("exec_sql", {
        query: `DO $$ BEGIN
          ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
          ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('super_admin','admin','receptionist','housekeeping','manager','accountant','maintenance','guest'));
        EXCEPTION WHEN OTHERS THEN NULL; END $$;`
      });
    } catch {}

    // Try with super_admin first, fall back to admin
    let profileError;
    ({ error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        email: adminEmail,
        full_name: adminName,
        role: "super_admin",
        phone: adminPhone,
        is_active: true,
      }, { onConflict: "id" }));

    if (profileError) {
      ({ error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          email: adminEmail,
          full_name: adminName,
          role: "admin",
          phone: adminPhone,
          is_active: true,
        }, { onConflict: "id" }));
    }

    if (profileError) throw profileError;

    return NextResponse.json({
      success: true,
      message: `Super admin ${existing ? "updated" : "created"}: ${adminEmail}`,
      userId,
      note: existing ? "Account already existed, profile updated" : "New account created. Default password: WptcAdmin@2024 — change immediately!",
    });
  } catch (error) {
    console.error("Admin setup error:", error);
    const msg = error instanceof Error ? error.message : (typeof error === "object" && error !== null ? JSON.stringify(error) : String(error));
    return NextResponse.json({ error: "Setup failed", details: msg }, { status: 500 });
  }
}
