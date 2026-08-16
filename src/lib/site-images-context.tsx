"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface SiteImagesValue {
  images: Record<string, string>;
  logo: string | null;
  blurs: Record<string, number>;
}

const SiteImagesContext = createContext<SiteImagesValue>({
  images: {},
  logo: null,
  blurs: {},
});

export function SiteImagesProvider({
  children,
  serverImages,
  serverLogo,
  serverBlurs,
}: {
  children: ReactNode;
  serverImages: Record<string, string>;
  serverLogo: string | null;
  serverBlurs: Record<string, number>;
}) {
  const [images, setImages] = useState<Record<string, string>>(serverImages);
  const [logo, setLogo] = useState<string | null>(serverLogo);
  const [blurs, setBlurs] = useState<Record<string, number>>(serverBlurs);

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
        if (data.blurs && typeof data.blurs === "object") {
          setBlurs(data.blurs);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <SiteImagesContext.Provider value={{ images, logo, blurs }}>
      {children}
    </SiteImagesContext.Provider>
  );
}

export function useSiteImagesCtx() {
  return useContext(SiteImagesContext);
}
