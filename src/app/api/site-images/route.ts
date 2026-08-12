import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { IMAGES } from "@/lib/images";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

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

type ImageValue = string | string[] | Record<string, string | string[]>;

function flattenImages(obj: Record<string, ImageValue>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      result[path] = value;
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => {
        result[`${path}[${i}]`] = v;
      });
    } else if (typeof value === "object") {
      Object.assign(result, flattenImages(value as Record<string, ImageValue>, path));
    }
  }
  return result;
}

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .like("key", "site_image:%");

    const overrides: Record<string, string> = {};
    data?.forEach((row: { key: string; value: string }) => {
      overrides[row.key.replace("site_image:", "")] = row.value;
    });

    const defaults = flattenImages(IMAGES as unknown as Record<string, ImageValue>);

    const merged: Record<string, string> = {};
    for (const [path, defaultUrl] of Object.entries(defaults)) {
      merged[path] = overrides[path] || defaultUrl;
    }

    return NextResponse.json({ images: merged, overrides });
  } catch (error) {
    console.error("Site images GET error:", error);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await createAuthClient();
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { path, url } = body as { path: string; url: string };

    if (!path || !url) {
      return NextResponse.json({ error: "Path and URL required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from("settings")
      .upsert({
        key: `site_image:${path}`,
        value: url,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "key" });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Site images POST error:", error);
    return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await createAuthClient();
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    if (!path) return NextResponse.json({ error: "Path required" }, { status: 400 });

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("settings")
      .delete()
      .eq("key", `site_image:${path}`);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Site images DELETE error:", error);
    return NextResponse.json({ error: "Failed to reset image" }, { status: 500 });
  }
}
