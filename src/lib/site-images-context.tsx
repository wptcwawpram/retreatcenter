"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface SiteImagesValue {
  images: Record<string, string>;
  logo: string | null;
}

const SiteImagesContext = createContext<SiteImagesValue>({
  images: {},
  logo: null,
});

export function SiteImagesProvider({
  children,
  serverImages,
  serverLogo,
}: {
  children: ReactNode;
  serverImages: Record<string, string>;
  serverLogo: string | null;
}) {
  const [images, setImages] = useState<Record<string, string>>(serverImages);
  const [logo, setLogo] = useState<string | null>(serverLogo);

  useEffect(() => {
    fetch("/api/site-images")
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        if (data.images && typeof data.images === "object") {
          setImages(data.images);
        }
        const logoUrl = data.overrides?.["branding.logo"] || null;
        setLogo(logoUrl);
      })
      .catch(() => {});
  }, []);

  return (
    <SiteImagesContext.Provider value={{ images, logo }}>
      {children}
    </SiteImagesContext.Provider>
  );
}

export function useSiteImagesCtx() {
  return useContext(SiteImagesContext);
}
