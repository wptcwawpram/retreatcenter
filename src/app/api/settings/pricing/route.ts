import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function serviceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

const PRICE_DEFAULTS: Record<string, number> = {
  price_faith_hall_no_ac: 400,
  price_faith_hall_ac: 550,
  price_pavilion_canopy: 900,
  price_pavilion_no_canopy: 700,
  price_kitchen_55plus: 500,
  price_kitchen_30to50: 400,
  price_kitchen_below20: 250,
  price_wedding_grounds: 4000,
};

/**
 * GET /api/settings/pricing — public endpoint for venue pricing
 */
export async function GET() {
  try {
    const supabase = serviceClient();
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", Object.keys(PRICE_DEFAULTS));

    const pricing: Record<string, number> = { ...PRICE_DEFAULTS };
    data?.forEach((row: { key: string; value: string }) => {
      const num = Number(row.value);
      if (!isNaN(num)) pricing[row.key] = num;
    });

    return NextResponse.json({
      halls: [
        { label: "Faith Hall (without AC)", price: pricing.price_faith_hall_no_ac },
        { label: "Faith Hall (with AC)", price: pricing.price_faith_hall_ac },
        { label: "Pavilion (with canopy)", price: pricing.price_pavilion_canopy },
        { label: "Pavilion (without canopy)", price: pricing.price_pavilion_no_canopy },
      ],
      kitchen: [
        { label: "Kitchen & Dining (55+ persons)", price: pricing.price_kitchen_55plus },
        { label: "Kitchen & Dining (30-50 persons)", price: pricing.price_kitchen_30to50 },
        { label: "Kitchen & Dining (below 20 persons)", price: pricing.price_kitchen_below20 },
      ],
      wedding_grounds: pricing.price_wedding_grounds,
    });
  } catch (error) {
    console.error("Pricing GET error:", error);
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 });
  }
}
