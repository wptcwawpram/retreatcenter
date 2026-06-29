"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { AMENITIES } from "@/lib/site-data";
import { IMAGES } from "@/lib/images";
import {
  BedDouble,
  TreePine,
  ChefHat,
  UtensilsCrossed,
  Store,
  Sofa,
  Church,
  Tent,
} from "lucide-react";

const SPRING = { type: "spring" as const, stiffness: 80, damping: 20, mass: 0.8 };
const SPRING_SNAPPY = { type: "spring" as const, stiffness: 200, damping: 25, mass: 0.5 };

function FadeIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ ...SPRING, delay }} className={className}>
      {children}
    </motion.div>
  );
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BedDouble,
  TreePine,
  ChefHat,
  UtensilsCrossed,
  Store,
  Sofa,
  Church,
  Tent,
};

const AMENITY_IMAGES: Record<string, string> = {
  Accommodation: IMAGES.amenities.accommodation,
  "Serene Environment": IMAGES.amenities.serene,
  Kitchen: IMAGES.amenities.kitchen,
  "Dining Area": IMAGES.amenities.dining,
  Store: IMAGES.amenities.store,
  "Common Room": IMAGES.amenities.commonRoom,
  "Faith Hall": IMAGES.amenities.faithHall,
  Pavilion: IMAGES.amenities.pavilion,
};

export default function AmenitiesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative text-white py-28 md:py-36 overflow-hidden">
        <Image
          src={IMAGES.hero.amenities}
          alt="Resort facilities"
          fill
          className="object-cover"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/50 to-stone-950/80" />
        <div className="relative container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.2 }}>
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase mb-4 text-amber-400">
              <span className="w-8 h-px bg-current" />
              Facilities
              <span className="w-8 h-px bg-current" />
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.4 }}
            className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Amenities &{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              Facilities
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.6 }}
            className="text-base md:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Modern facilities set within a peaceful, lush environment designed
            for your comfort and spiritual renewal.
          </motion.p>
        </div>
      </section>

      {/* Amenities Grid */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {AMENITIES.map((amenity, i) => {
              const Icon = ICON_MAP[amenity.icon] ?? Church;
              const imgSrc = AMENITY_IMAGES[amenity.title];
              return (
                <FadeIn key={amenity.title} delay={i * 0.08}>
                  <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={SPRING_SNAPPY}
                    className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-stone-100 hover:border-amber-200 shadow-md hover:shadow-xl transition-shadow duration-300"
                  >
                    {imgSrc && (
                      <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 overflow-hidden">
                        <Image
                          src={imgSrc}
                          alt={amenity.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, 200px"
                        />
                      </div>
                    )}
                    <div className="flex items-start gap-4 p-6">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-stone-900 mb-2">
                          {amenity.title}
                        </h3>
                        <p className="text-stone-500 leading-relaxed text-sm">
                          {amenity.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
