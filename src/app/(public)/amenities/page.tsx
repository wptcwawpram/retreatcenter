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

function FadeIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ ...SPRING, delay }} className={className}>
      {children}
    </motion.div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-4">
      <span className="h-px w-8 bg-gold/40" />
      <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-gold">{label}</span>
      <span className="h-px w-8 bg-gold/40" />
    </div>
  );
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BedDouble, TreePine, ChefHat, UtensilsCrossed, Store, Sofa, Church, Tent,
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
        <Image src={IMAGES.hero.amenities} alt="Resort facilities" fill className="object-cover" priority quality={85} />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/80 via-charcoal/50 to-charcoal/80" />
        <div className="relative container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.2 }}>
            <SectionLabel label="Facilities" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.4 }}
            className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Amenities &amp;{" "}
            <span className="bg-gradient-to-r from-gold to-gold-dark bg-clip-text text-transparent">Facilities</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.6 }}
            className="text-base md:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Modern facilities set within a peaceful, lush environment designed for your comfort and spiritual renewal.
          </motion.p>
        </div>
      </section>

      {/* Amenities Grid */}
      <section className="py-20 md:py-28 bg-ivory">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {AMENITIES.map((amenity, i) => {
              const Icon = ICON_MAP[amenity.icon] ?? Church;
              const imgSrc = AMENITY_IMAGES[amenity.title];
              return (
                <FadeIn key={amenity.title} delay={i * 0.06}>
                  <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className="group flex flex-col sm:flex-row overflow-hidden rounded-xl border border-neutral-100 bg-white hover:shadow-xl transition-shadow duration-500"
                  >
                    {imgSrc && (
                      <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 overflow-hidden">
                        <Image
                          src={imgSrc}
                          alt={amenity.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 640px) 100vw, 200px"
                        />
                      </div>
                    )}
                    <div className="flex items-start gap-4 p-6">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-gold/8 border border-gold/10 flex items-center justify-center text-gold group-hover:bg-gold/15 transition-colors duration-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-charcoal mb-2">
                          {amenity.title}
                        </h3>
                        <p className="text-neutral-500 leading-relaxed text-sm">
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
