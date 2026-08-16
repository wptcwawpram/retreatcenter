"use client";

import { useState, useEffect } from "react";
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
  const [images, setImages] = useState<Record<string, string>>(defaults);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/site-images")
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data.images && typeof data.images === "object") {
          setImages(data.images);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return images;
}

export function img(images: Record<string, string>, path: string): string {
  return images[path] || defaults[path] || "";
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
