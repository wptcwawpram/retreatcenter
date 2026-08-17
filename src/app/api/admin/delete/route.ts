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

const ALLOWED_TABLES = ["bookings", "guests", "payments", "complaints", "rooms", "events", "housekeeping_tasks", "inventory_items", "finance_records", "finance_accounts", "finance_categories", "finance_transfers", "profiles"];

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { table, id } = await request.json();

    if (!table || !id) {
      return NextResponse.json({ error: "Table and id are required" }, { status: 400 });
    }

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    const supabase = serviceClient();

    // For bookings, also delete related records first
    if (table === "bookings") {
      await supabase.from("booking_rooms").delete().eq("booking_id", id);
      await supabase.from("payments").delete().eq("booking_id", id);
      await supabase.from("finance_records").delete().eq("booking_id", id);
      await supabase.from("complaints").delete().eq("booking_id", id);
    }

    // For guests, delete their bookings (and related) first
    if (table === "guests") {
      const { data: bookings } = await supabase.from("bookings").select("id").eq("guest_id", id);
      if (bookings) {
        for (const b of bookings) {
          await supabase.from("booking_rooms").delete().eq("booking_id", b.id);
          await supabase.from("payments").delete().eq("booking_id", b.id);
          await supabase.from("finance_records").delete().eq("booking_id", b.id);
          await supabase.from("complaints").delete().eq("booking_id", b.id);
        }
        await supabase.from("bookings").delete().eq("guest_id", id);
      }
    }

    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
