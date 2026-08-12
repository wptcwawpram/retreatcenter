"use client";

import { useState, useEffect } from "react";

let cachedLogo: string | null = null;
let fetchPromise: Promise<string | null> | null = null;

function fetchLogo(): Promise<string | null> {
  if (!fetchPromise) {
    fetchPromise = fetch("/api/site-images")
      .then((res) => res.json())
      .then((data) => {
        cachedLogo = data.overrides?.["branding.logo"] || null;
        return cachedLogo;
      })
      .catch(() => null);
  }
  return fetchPromise;
}

export function useSiteLogo() {
  const [logo, setLogo] = useState<string | null>(cachedLogo);

  useEffect(() => {
    if (cachedLogo !== null) {
      setLogo(cachedLogo);
      return;
    }
    fetchLogo().then((url) => setLogo(url));
  }, []);

  return logo;
}
