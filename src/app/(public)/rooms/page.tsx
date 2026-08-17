"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, type ReactNode } from "react";
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
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/rooms/prices")
      .then((r) => r.json())
      .then((data) => {
        if (data.types?.length > 0) {
          const map: Record<string, number> = {};
          data.types.forEach((t: { slug: string; price: number }) => { map[t.slug] = t.price; });
          setLivePrices(map);
        }
      })
      .catch(() => {});
  }, []);

  const rooms = ROOMS.map((r) => ({
    ...r,
    price: livePrices[r.slug] ?? r.price,
  }));

  const filtered = rooms.filter((room) => {
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
          <div className="flex justify-center gap-3 mb-14">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-7 py-3 text-[11px] tracking-[0.15em] uppercase transition-all duration-300 rounded-xl border backdrop-blur-xl overflow-hidden ${
                  activeTab === tab
                    ? "bg-gold/[0.12] border-gold/40 text-gold shadow-[0_4px_20px_rgba(212,175,55,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]"
                    : "border-white/[0.1] bg-white/[0.04] text-warm-muted hover:text-warm-white hover:border-gold/30 hover:bg-white/[0.08] hover:shadow-[0_4px_20px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.08)] hover:scale-[1.03] active:scale-[0.97]"
                }`}
              >
                <span className="relative z-10">{tab}</span>
                {activeTab === tab && (
                  <span className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
                )}
              </button>
            ))}
          </div>

          {/* Room Cards */}
          <div className="space-y-20 max-w-5xl mx-auto">
            {filtered.map((room, i) => (
              <FadeIn key={room.slug} delay={i * 0.08}>
                <div className={`group/card grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/[0.15] transition-all duration-500 hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)] ${i % 2 === 1 ? "lg:direction-rtl" : ""}`}>
                  {/* Image */}
                  <div className={`relative aspect-[4/3] lg:aspect-auto lg:min-h-[400px] overflow-hidden ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                    <Image
                      src={img(siteImages, `rooms.${room.slug}`)}
                      alt={room.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    {room.featured && (
                      <span className="absolute top-4 left-4 bg-gold/90 backdrop-blur-sm text-luxury text-[9px] font-bold tracking-[0.15em] uppercase px-3 py-1.5 rounded-lg">
                        Premium
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className={`bg-white/[0.03] backdrop-blur-xl border-l border-white/[0.06] p-8 md:p-10 flex flex-col justify-center transition-colors duration-500 group-hover/card:bg-white/[0.06] ${i % 2 === 1 ? "lg:order-1 lg:border-l-0 lg:border-r lg:border-r-white/[0.06]" : ""}`}>
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
                        <Button className="rounded-xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-xl text-gold hover:bg-gold/[0.12] hover:border-gold/40 hover:shadow-[0_4px_20px_rgba(212,175,55,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] hover:scale-[1.04] active:scale-[0.96] text-[11px] tracking-[0.12em] uppercase h-10 px-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300">
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
              <Button variant="outline" className="rounded-xl border-white/[0.12] bg-white/[0.06] backdrop-blur-xl text-gold hover:bg-gold/[0.12] hover:border-gold/40 hover:shadow-[0_4px_20px_rgba(212,175,55,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] hover:scale-[1.04] active:scale-[0.96] gap-2 text-[11px] tracking-[0.12em] uppercase h-10 px-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300">
                Contact Us <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
