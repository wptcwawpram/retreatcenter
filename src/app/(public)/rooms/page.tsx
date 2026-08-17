"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ROOMS } from "@/lib/site-data";
import { useSiteImages, useSiteBlurs, img, imgBlurStyle } from "@/lib/use-site-images";
import { BedDouble, Users, ArrowRight, Check } from "lucide-react";

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

const TABS = ["All Rooms", "Standard", "Premium"] as const;

export default function RoomsPage() {
  const siteImages = useSiteImages();
  const siteBlurs = useSiteBlurs();
  const [activeTab, setActiveTab] = useState<string>("All Rooms");

  const filtered = ROOMS.filter((room) => {
    if (activeTab === "All Rooms") return true;
    if (activeTab === "Premium") return room.featured;
    return !room.featured;
  });

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] overflow-hidden bg-luxury">
        <Image src={img(siteImages, "hero.rooms")} alt="Our Rooms" fill className="object-cover" style={imgBlurStyle(siteBlurs, "hero.rooms")} priority quality={85} />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative h-full flex items-center justify-center text-center">
          <div>
            <div className="w-10 h-px bg-gold mx-auto mb-5" />
            <p className="text-gold/60 text-[11px] tracking-[0.2em] uppercase mb-3">Accommodation</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white mb-4">
              Rooms & Suites
            </h1>
            <p className="text-warm-muted text-base max-w-2xl mx-auto">
              From shared rooms to premium suites — find the perfect space for your retreat.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs + Room Grid */}
      <section className="py-20 md:py-28 bg-luxury">
        <div className="container mx-auto px-6">
          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-14">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 text-[11px] tracking-[0.15em] uppercase transition-all duration-300 rounded-lg border backdrop-blur-sm ${
                  activeTab === tab
                    ? "bg-gold/10 border-gold/30 text-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    : "border-white/[0.08] bg-white/[0.03] text-warm-muted hover:text-warm-white hover:border-gold/20 hover:bg-white/[0.05]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Room Cards */}
          <div className="space-y-20 max-w-5xl mx-auto">
            {filtered.map((room, i) => (
              <FadeIn key={room.slug} delay={i * 0.08}>
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-0 ${i % 2 === 1 ? "lg:direction-rtl" : ""}`}>
                  {/* Image */}
                  <div className={`relative aspect-[4/3] lg:aspect-auto lg:min-h-[400px] overflow-hidden ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                    <Image
                      src={img(siteImages, `rooms.${room.slug}`)}
                      alt={room.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    {room.featured && (
                      <span className="absolute top-4 left-4 bg-gold/90 text-luxury text-[9px] font-bold tracking-[0.15em] uppercase px-3 py-1.5">
                        Premium
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className={`bg-luxury-card border border-gold/8 p-8 md:p-10 flex flex-col justify-center ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                    <div className="flex items-center gap-4 text-[11px] text-warm-muted mb-4">
                      <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-gold/50" />{room.capacity} Guests</span>
                      <span className="flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5 text-gold/50" />{room.beds} Beds</span>
                    </div>

                    <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-warm-white mb-3">
                      {room.name}
                    </h2>
                    <div className="w-10 h-px bg-gold/25 mb-4" />
                    <p className="text-warm-muted leading-relaxed mb-6">
                      {room.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mb-8">
                      {room.amenities.slice(0, 6).map((a) => (
                        <div key={a} className="flex items-center gap-2 text-[12px] text-warm-muted">
                          <Check className="h-3 w-3 text-gold/50 shrink-0" />{a}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-gold">GH&#x20B5;{room.price}</span>
                        <span className="text-warm-muted text-sm ml-1">/ night</span>
                      </div>
                      <Link href={`/booking?room=${room.slug}`}>
                        <Button className="rounded-lg border border-white/[0.12] bg-white/[0.06] backdrop-blur-md text-gold hover:bg-gold/10 hover:border-gold/30 text-[11px] tracking-[0.12em] uppercase h-10 px-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300">
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-luxury-card border-t border-gold/8">
        <div className="container mx-auto px-6 text-center">
          <FadeIn>
            <p className="text-warm-muted mb-4">Can&rsquo;t find what you need?</p>
            <Link href="/contact">
              <Button variant="outline" className="rounded-lg border-white/[0.12] bg-white/[0.06] backdrop-blur-md text-gold hover:bg-gold/10 hover:border-gold/30 gap-2 text-[11px] tracking-[0.12em] uppercase h-10 px-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300">
                Contact Us <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
