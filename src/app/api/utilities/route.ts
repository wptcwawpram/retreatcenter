import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } } },
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

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = serviceClient();

    const [logsRes, statusRes] = await Promise.all([
      supabase.from("utility_logs").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("utility_status").select("*"),
    ]);

    return NextResponse.json({
      logs: logsRes.data || [],
      statuses: statusRes.data || [],
    });
  } catch (error) {
    console.error("Utilities GET error:", error);
    return NextResponse.json({ error: "Failed to fetch utilities" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { utility_type, event_type, reading_value, description } = body;

    if (!utility_type || !event_type) {
      return NextResponse.json({ error: "utility_type and event_type are required" }, { status: 400 });
    }

    const supabase = serviceClient();

    // Insert log entry
    const { data, error } = await supabase
      .from("utility_logs")
      .insert({
        utility_type,
        event_type,
        reading_value: reading_value ?? null,
        description: description || null,
        logged_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Update status snapshot
    const statusUpdate: Record<string, unknown> = {
      last_event: event_type + (description ? `: ${description}` : ""),
      last_event_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (reading_value !== undefined && reading_value !== null) {
      statusUpdate.current_reading = reading_value;
    }

    // Derive status from event type
    if (event_type === "OUTAGE_START") statusUpdate.status = "OUTAGE";
    else if (event_type === "OUTAGE_END") statusUpdate.status = "NORMAL";
    else if (event_type === "GENERATOR_START") statusUpdate.status = "RUNNING";
    else if (event_type === "GENERATOR_STOP") statusUpdate.status = "STANDBY";
    else if (event_type === "WATER_READING" || event_type === "WATER_REFILL") {
      const val = Number(reading_value);
      statusUpdate.status = val <= 20 ? "CRITICAL" : val <= 40 ? "LOW" : "NORMAL";
    }
    else if (event_type === "FUEL_READING") {
      const val = Number(reading_value);
      statusUpdate.status = val <= 15 ? "CRITICAL" : val <= 30 ? "LOW" : "STANDBY";
    }

    await supabase
      .from("utility_status")
      .update(statusUpdate)
      .eq("utility_type", utility_type);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Utilities POST error:", error);
    return NextResponse.json({ error: "Failed to log utility event" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Log ID required" }, { status: 400 });

    const supabase = serviceClient();
    const { error } = await supabase.from("utility_logs").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Utilities DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete log" }, { status: 500 });
  }
}
