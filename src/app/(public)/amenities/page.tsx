"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { AMENITIES } from "@/lib/site-data";
import { IMAGES } from "@/lib/images";
import { BedDouble, TreePine, ChefHat, UtensilsCrossed, Store, Sofa, Church, Tent } from "lucide-react";

const SPRING = { type: "spring" as const, stiffness: 80, damping: 20, mass: 0.8 };

function FadeIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={{ ...SPRING, delay }} className={className}>
      {children}
    </motion.div>
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
      <section className="relative h-[45vh] min-h-[320px] overflow-hidden bg-neutral-900">
        <Image src={IMAGES.hero.amenities} alt="Facilities" fill className="object-cover" priority quality={85} />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative h-full flex items-center justify-center text-center">
          <div>
            <p className="text-burnt-light text-xs font-bold tracking-[0.2em] uppercase mb-3">Facilities</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
              Amenities & Facilities
            </h1>
            <p className="text-white/60 text-base max-w-2xl mx-auto">
              Modern facilities set within a peaceful, lush environment for your comfort and spiritual renewal.
            </p>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <div className="space-y-6 max-w-5xl mx-auto">
            {AMENITIES.map((amenity, i) => {
              const Icon = ICON_MAP[amenity.icon] ?? Church;
              const imgSrc = AMENITY_IMAGES[amenity.title];
              const isEven = i % 2 === 0;
              return (
                <FadeIn key={amenity.title} delay={i * 0.04}>
                  <div className={`group flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} overflow-hidden rounded-xl border border-neutral-100 bg-white hover:shadow-lg transition-shadow duration-500`}>
                    {imgSrc && (
                      <div className="relative w-full md:w-[300px] h-52 md:h-auto shrink-0 overflow-hidden">
                        <Image
                          src={imgSrc}
                          alt={amenity.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, 300px"
                        />
                      </div>
                    )}
                    <div className="flex items-start gap-4 p-6 md:p-8">
                      <div className="shrink-0 w-11 h-11 rounded-lg bg-burnt/8 flex items-center justify-center text-burnt">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-neutral-900 mb-2">
                          {amenity.title}
                        </h3>
                        <p className="text-neutral-500 leading-relaxed text-sm">{amenity.description}</p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
