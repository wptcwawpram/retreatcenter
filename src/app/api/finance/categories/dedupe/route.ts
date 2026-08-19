import { NextResponse } from "next/server";
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

export async function POST() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = serviceClient();
    const { data: all } = await supabase
      .from("finance_categories")
      .select("*")
      .order("sort_order")
      .order("created_at");

    if (!all) return NextResponse.json({ removed: 0 });

    const seen = new Map<string, string>();
    const toDelete: string[] = [];

    for (const cat of all) {
      const key = `${cat.name}::${cat.type}`;
      if (seen.has(key)) {
        toDelete.push(cat.id);
      } else {
        seen.set(key, cat.id);
      }
    }

    if (toDelete.length > 0) {
      await supabase.from("finance_categories").delete().in("id", toDelete);
    }

    return NextResponse.json({ removed: toDelete.length });
  } catch (error) {
    console.error("Dedupe error:", error);
    return NextResponse.json({ error: "Failed to deduplicate" }, { status: 500 });
  }
}
