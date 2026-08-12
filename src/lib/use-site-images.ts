"use client";

import { useState, useEffect } from "react";
import { IMAGES } from "./images";

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

export function getImageUrl(path: string, overrides: Record<string, string>): string {
  return overrides[path] || defaults[path] || "";
}

export function useSiteImages() {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/site-images")
      .then((res) => res.json())
      .then((data) => {
        setOverrides(data.overrides || {});
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const getImage = (path: string) => getImageUrl(path, overrides);

  return { getImage, overrides, loaded, IMAGES };
}
