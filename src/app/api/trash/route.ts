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

// Only entities that are safe to snapshot + restore generically (no financial
// side effects). Payments / finance keep their own delete + undo.
const ALLOWED = new Set([
  "bookings", "guests", "rooms", "inventory_items",
  "housekeeping_tasks", "complaints", "events", "finance_categories",
]);

const LABELS: Record<string, string> = {
  bookings: "Booking", guests: "Guest", rooms: "Room", inventory_items: "Item",
  housekeeping_tasks: "Task", complaints: "Complaint", events: "Event", finance_categories: "Category",
};

// Non-cascade child references that must be detached before a parent can be deleted.
// (nullable columns only — we set them to null so the child rows survive)
const DETACH: Record<string, Array<{ table: string; column: string }>> = {
  bookings: [
    { table: "finance_records", column: "booking_id" },
    { table: "complaints", column: "booking_id" },
  ],
  rooms: [
    { table: "complaints", column: "room_id" },
  ],
  guests: [
    { table: "complaints", column: "guest_id" },
  ],
};

// GET /api/trash — list items currently in the bin
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const supabase = serviceClient();
    const { data, error } = await supabase
      .from("deleted_items")
      .select("*")
      .order("deleted_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return NextResponse.json({ items: data || [] });
  } catch (error) {
    console.error("Trash GET error:", error);
    return NextResponse.json({ items: [] });
  }
}

// POST /api/trash { table, id, label? } — snapshot the row, then delete it
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { table, id, label } = await request.json();
    if (!table || !id) return NextResponse.json({ error: "table and id are required" }, { status: 400 });
    if (!ALLOWED.has(table)) return NextResponse.json({ error: `Table not supported by the bin: ${table}` }, { status: 400 });

    const supabase = serviceClient();

    const { data: row, error: readErr } = await supabase.from(table).select("*").eq("id", id).single();
    if (readErr || !row) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const { data: trash, error: insErr } = await supabase
      .from("deleted_items")
      .insert({ entity_type: table, entity_id: id, label: label || `${LABELS[table] || "Item"}`, data: row, deleted_by: user.id })
      .select()
      .single();
    if (insErr) throw insErr;

    // Detach non-cascade child references so the delete isn't blocked by FKs
    for (const d of DETACH[table] || []) {
      await supabase.from(d.table).update({ [d.column]: null }).eq(d.column, id).then(() => {}, () => {});
    }

    const { error: delErr } = await supabase.from(table).delete().eq("id", id);
    if (delErr) {
      // roll back the snapshot so we don't leave an orphan bin entry
      await supabase.from("deleted_items").delete().eq("id", trash.id);
      const friendly = /foreign key|violates/i.test(delErr.message)
        ? "Can't delete - it still has linked records that block removal."
        : delErr.message;
      return NextResponse.json({ error: friendly }, { status: 409 });
    }

    return NextResponse.json({ success: true, trashId: trash.id });
  } catch (error) {
    console.error("Trash POST error:", error);
    const msg = error instanceof Error ? error.message : "Failed to move to bin";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH /api/trash { trashId } — restore an item back to its table
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { trashId } = await request.json();
    if (!trashId) return NextResponse.json({ error: "trashId is required" }, { status: 400 });

    const supabase = serviceClient();
    const { data: trash, error: readErr } = await supabase.from("deleted_items").select("*").eq("id", trashId).single();
    if (readErr || !trash) return NextResponse.json({ error: "Bin item not found" }, { status: 404 });

    const { error: insErr } = await supabase.from(trash.entity_type).upsert(trash.data);
    if (insErr) throw insErr;

    await supabase.from("deleted_items").delete().eq("id", trashId);
    return NextResponse.json({ success: true, entity_type: trash.entity_type, entity_id: trash.entity_id });
  } catch (error) {
    console.error("Trash PATCH error:", error);
    const msg = error instanceof Error ? error.message : "Failed to restore";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/trash { trashId } or { all: true } — permanently remove
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { trashId, all } = await request.json();
    const supabase = serviceClient();

    if (all) {
      await supabase.from("deleted_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      return NextResponse.json({ success: true });
    }
    if (!trashId) return NextResponse.json({ error: "trashId or all is required" }, { status: 400 });
    await supabase.from("deleted_items").delete().eq("id", trashId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Trash DELETE error:", error);
    return NextResponse.json({ error: "Failed to empty bin" }, { status: 500 });
  }
}
