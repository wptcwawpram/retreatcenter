"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SlideContent } from "@/lib/get-site-images";

interface SiteImagesValue {
  images: Record<string, string>;
  logo: string | null;
  blurs: Record<string, number>;
  slides: Record<string, SlideContent>;
}

const SiteImagesContext = createContext<SiteImagesValue>({
  images: {},
  logo: null,
  blurs: {},
  slides: {},
});

export function SiteImagesProvider({
  children,
  serverImages,
  serverLogo,
  serverBlurs,
  serverSlides,
}: {
  children: ReactNode;
  serverImages: Record<string, string>;
  serverLogo: string | null;
  serverBlurs: Record<string, number>;
  serverSlides: Record<string, SlideContent>;
}) {
  const [images, setImages] = useState<Record<string, string>>(serverImages);
  const [logo, setLogo] = useState<string | null>(serverLogo);
  const [blurs, setBlurs] = useState<Record<string, number>>(serverBlurs);
  const [slides, setSlides] = useState<Record<string, SlideContent>>(serverSlides);

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
        if (data.slides && typeof data.slides === "object") {
          setSlides(data.slides);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <SiteImagesContext.Provider value={{ images, logo, blurs, slides }}>
      {children}
    </SiteImagesContext.Provider>
  );
}

export function useSiteImagesCtx() {
  return useContext(SiteImagesContext);
}
