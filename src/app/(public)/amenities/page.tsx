"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AMENITIES } from "@/lib/site-data";
import { IMAGES } from "@/lib/images";
import { ArrowRight, BedDouble, TreePine, ChefHat, UtensilsCrossed, Store, Sofa, Church, Tent } from "lucide-react";

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
      <section className="relative h-[50vh] min-h-[350px] overflow-hidden bg-luxury">
        <Image src={IMAGES.hero.amenities} alt="Amenities" fill className="object-cover" priority quality={85} />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative h-full flex items-center justify-center text-center">
          <div>
            <div className="w-10 h-px bg-gold mx-auto mb-5" />
            <p className="text-gold/60 text-[11px] tracking-[0.2em] uppercase mb-3">Facilities</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white mb-4">
              Amenities
            </h1>
            <p className="text-warm-muted text-base max-w-2xl mx-auto">
              Everything you need for a comfortable and memorable retreat experience.
            </p>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="py-24 md:py-32 bg-luxury">
        <div className="container mx-auto px-6 max-w-6xl">
          {AMENITIES.map((amenity, i) => {
            const Icon = ICON_MAP[amenity.icon];
            const img = AMENITY_IMAGES[amenity.title];
            const isEven = i % 2 === 0;

            return (
              <FadeIn key={amenity.title} delay={0.05}>
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-0 mb-1 ${!isEven ? "" : ""}`}>
                  <div className={`relative aspect-[16/10] lg:aspect-auto lg:min-h-[320px] overflow-hidden ${!isEven ? "lg:order-2" : ""}`}>
                    {img && <Image src={img} alt={amenity.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />}
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                  <div className={`bg-luxury-card border border-gold/8 p-8 md:p-12 flex flex-col justify-center ${!isEven ? "lg:order-1" : ""}`}>
                    {Icon && <Icon className="h-5 w-5 text-gold/60 mb-4" />}
                    <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-warm-white mb-3">{amenity.title}</h3>
                    <div className="w-10 h-px bg-gold/25 mb-4" />
                    <p className="text-warm-muted leading-relaxed">{amenity.description}</p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-luxury-card border-t border-gold/8">
        <div className="container mx-auto px-6 text-center">
          <FadeIn>
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-warm-white mb-3">
              Ready to Experience Our Facilities?
            </h3>
            <p className="text-warm-muted mb-6">Book your stay and enjoy all our amenities.</p>
            <Link href="/booking">
              <Button className="bg-gold text-luxury hover:bg-gold-bright font-semibold h-11 px-8 text-[11px] tracking-[0.12em] uppercase">
                Book Now <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
