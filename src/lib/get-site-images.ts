import { createServerClient } from "@supabase/ssr";
import { IMAGES } from "@/lib/images";

type ImageValue = string | string[] | Record<string, string | string[]>;

function flattenImages(obj: Record<string, ImageValue>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      result[path] = value;
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => { result[`${path}[${i}]`] = v; });
    } else if (typeof value === "object") {
      Object.assign(result, flattenImages(value as Record<string, ImageValue>, path));
    }
  }
  return result;
}

const defaults = flattenImages(IMAGES as unknown as Record<string, ImageValue>);

export async function getSiteImages(): Promise<{
  images: Record<string, string>;
  logo: string | null;
}> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } },
    );

    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .like("key", "site_image:%");

    const overrides: Record<string, string> = {};
    data?.forEach((row: { key: string; value: string }) => {
      overrides[row.key.replace("site_image:", "")] = row.value;
    });

    const merged: Record<string, string> = {};
    for (const [path, defaultUrl] of Object.entries(defaults)) {
      merged[path] = overrides[path] || defaultUrl;
    }

    return {
      images: merged,
      logo: overrides["branding.logo"] || null,
    };
  } catch {
    return { images: defaults, logo: null };
  }
}
