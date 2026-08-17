import { NextRequest, NextResponse } from "next/server";
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

/**
 * GET /api/settings — fetch all settings
 */
export async function GET() {
  try {
    const auth = await createAuthClient();
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createServiceClient();
    const { data, error } = await supabase.from("settings").select("key, value");
    if (error) throw error;

    const settings: Record<string, string> = {};
    data?.forEach((row: { key: string; value: string }) => {
      settings[row.key] = row.value;
    });
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

/**
 * POST /api/settings — upsert settings
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await createAuthClient();
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { settings } = body as { settings: Record<string, string> };

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Settings object required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Upsert each setting
    const rows = Object.entries(settings).map(([key, value]) => ({
      key,
      value: String(value),
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("settings")
      .upsert(rows, { onConflict: "key" });

    if (error) throw error;

    // Propagate pricing changes to rooms
    const priceMap: Record<string, string[]> = {
      price_2in1: ["2_IN_1"],
      price_3in1: ["3_IN_1"],
      price_4in1: ["4_IN_1"],
      price_6in1: ["6_IN_1"],
      price_suite_fan: ["SUITE_FAN"],
      price_suite_ac: ["SUITE_AC"],
      price_apartment: ["APARTMENT"],
    };

    for (const [key, types] of Object.entries(priceMap)) {
      if (settings[key]) {
        const price = Number(settings[key]);
        if (!isNaN(price) && price >= 0) {
          await supabase
            .from("rooms")
            .update({ price_per_night: price })
            .in("type", types);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
