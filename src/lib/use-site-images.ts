"use client";

import { useSiteImagesCtx } from "@/lib/site-images-context";
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

export function useSiteImages() {
  const { images } = useSiteImagesCtx();
  return images;
}

export function useSiteBlurs() {
  const { blurs } = useSiteImagesCtx();
  return blurs;
}

export function img(images: Record<string, string>, path: string): string {
  return images[path] || defaults[path] || "";
}

export function imgBlurStyle(blurs: Record<string, number>, path: string): React.CSSProperties | undefined {
  const value = blurs[path] || 0;
  if (value === 0) return undefined;
  return { filter: `blur(${value / 5}px)`, transform: "scale(1.05)" };
}

export function imgArray(images: Record<string, string>, prefix: string): string[] {
  const result: string[] = [];
  let i = 0;
  while (images[`${prefix}[${i}]`] || defaults[`${prefix}[${i}]`]) {
    result.push(images[`${prefix}[${i}]`] || defaults[`${prefix}[${i}]`]);
    i++;
  }
  return result;
}
