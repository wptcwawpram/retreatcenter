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
  blurs: Record<string, number>;
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
      .or("key.like.site_image:%,key.like.site_image_blur:%");

    const overrides: Record<string, string> = {};
    const blurs: Record<string, number> = {};
    data?.forEach((row: { key: string; value: string }) => {
      if (row.key.startsWith("site_image_blur:")) {
        blurs[row.key.replace("site_image_blur:", "")] = Number(row.value) || 0;
      } else if (row.key.startsWith("site_image:")) {
        overrides[row.key.replace("site_image:", "")] = row.value;
      }
    });

    const merged: Record<string, string> = {};
    for (const [path, defaultUrl] of Object.entries(defaults)) {
      merged[path] = overrides[path] || defaultUrl;
    }

    return {
      images: merged,
      logo: overrides["branding.logo"] || null,
      blurs,
    };
  } catch {
    return { images: defaults, logo: null, blurs: {} };
  }
}
