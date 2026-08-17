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

export async function GET(request: NextRequest) {
  try {
    const formType = request.nextUrl.searchParams.get("type") || "booking";
    const supabase = serviceClient();

    // Try to get from DB first
    const { data } = await supabase
      .from("form_configs")
      .select("*")
      .eq("form_type", formType)
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      return NextResponse.json(data);
    }

    // Return default config if none exists
    return NextResponse.json({ form_type: formType, config: null, is_active: true });
  } catch (error) {
    console.error("Form config fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch form config" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { form_type, config, name } = body;

    if (!form_type || !config) {
      return NextResponse.json({ error: "form_type and config are required" }, { status: 400 });
    }

    const supabase = serviceClient();

    // Ensure table exists
    try {
      await supabase.rpc("exec_sql", {
        query: `CREATE TABLE IF NOT EXISTS form_configs (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          form_type text NOT NULL DEFAULT 'booking',
          name text,
          config jsonb NOT NULL DEFAULT '{}',
          is_active boolean DEFAULT true,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now(),
          created_by uuid REFERENCES auth.users(id)
        );`
      });
    } catch {}

    // Deactivate existing configs for this form type
    await supabase
      .from("form_configs")
      .update({ is_active: false })
      .eq("form_type", form_type);

    // Insert new config
    const { data, error } = await supabase
      .from("form_configs")
      .insert({
        form_type,
        name: name || `${form_type} form`,
        config,
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Form config save error:", error);
    return NextResponse.json({ error: "Failed to save form config" }, { status: 500 });
  }
}
