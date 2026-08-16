"use client";

import { useState, useEffect } from "react";

const CACHE_KEY = "wptc_site_logo";

function getCachedLogo(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(CACHE_KEY) || null;
  } catch {}
  return null;
}

export function useSiteLogo() {
  const [logo, setLogo] = useState<string | null>(getCachedLogo);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/site-images")
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const url = data.overrides?.["branding.logo"] || null;
        setLogo(url);
        try {
          if (url) localStorage.setItem(CACHE_KEY, url);
          else localStorage.removeItem(CACHE_KEY);
        } catch {}
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return logo;
}
