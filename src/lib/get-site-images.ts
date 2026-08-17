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

export interface SlideContent {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  button2Text: string;
  button2Link: string;
}

export async function getSiteImages(): Promise<{
  images: Record<string, string>;
  logo: string | null;
  blurs: Record<string, number>;
  slides: Record<string, SlideContent>;
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
      .or("key.like.site_image:%,key.like.site_image_blur:%,key.like.site_slider:%");

    const overrides: Record<string, string> = {};
    const blurs: Record<string, number> = {};
    const slides: Record<string, SlideContent> = {};
    data?.forEach((row: { key: string; value: string }) => {
      if (row.key.startsWith("site_slider:")) {
        const idx = row.key.replace("site_slider:", "");
        try { slides[idx] = JSON.parse(row.value); } catch {}
      } else if (row.key.startsWith("site_image_blur:")) {
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
      slides,
    };
  } catch {
    return { images: defaults, logo: null, blurs: {}, slides: {} };
  }
}
