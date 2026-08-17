import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

const TYPE_LABELS: Record<string, string> = {
  "2_IN_1": "2 IN 1",
  "3_IN_1": "3 IN 1",
  "4_IN_1": "4 IN 1",
  "6_IN_1": "6 IN 1",
  "SUITE_FAN": "Suite (Fan)",
  "SUITE_AC": "Suite (AC)",
  "APARTMENT": "Holy Family Apartment",
};

const TYPE_SLUGS: Record<string, string> = {
  "2_IN_1": "2-in-1",
  "3_IN_1": "3-in-1",
  "4_IN_1": "4-in-1",
  "6_IN_1": "6-in-1",
  "SUITE_FAN": "suite-fan",
  "SUITE_AC": "suite-ac",
  "APARTMENT": "holy-family-apartment",
};

export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data: rooms, error } = await supabase
      .from("rooms")
      .select("type, price_per_night")
      .order("type");

    if (error) throw error;

    const typeMap = new Map<string, number>();
    (rooms ?? []).forEach((r: { type: string; price_per_night: number }) => {
      if (!typeMap.has(r.type)) {
        typeMap.set(r.type, r.price_per_night);
      }
    });

    const types = Array.from(typeMap.entries()).map(([type, price]) => ({
      type,
      label: TYPE_LABELS[type] || type,
      slug: TYPE_SLUGS[type] || type.toLowerCase(),
      price,
    }));

    return NextResponse.json({ types });
  } catch (error) {
    console.error("Room prices error:", error);
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
}
