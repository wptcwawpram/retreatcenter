"use client";

import { useSiteImagesCtx } from "@/lib/site-images-context";

export function useSiteLogo() {
  const { logo } = useSiteImagesCtx();
  return logo;
}
