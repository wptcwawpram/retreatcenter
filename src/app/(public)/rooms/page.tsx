"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ROOMS, HALLS } from "@/lib/site-data";
import { IMAGES } from "@/lib/images";
import { BedDouble, Users, Star, Maximize } from "lucide-react";

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

const TABS = ["All Rooms", "Suites", "Double Rooms", "Group Rooms"] as const;

export default function RoomsPage() {
  const [activeTab, setActiveTab] = useState<string>("All Rooms");

  const filteredRooms = ROOMS.filter((room) => {
    if (activeTab === "All Rooms") return true;
    if (activeTab === "Suites") return room.slug.includes("suite") || room.slug === "holy-family-apartment";
    if (activeTab === "Double Rooms") return room.slug === "2-in-1";
    if (activeTab === "Group Rooms") return room.slug === "4-in-1" || room.slug === "6-in-1";
    return true;
  });

  return (
    <>
      {/* Hero */}
      <section className="relative text-white py-28 md:py-36 overflow-hidden">
        <Image src={IMAGES.hero.rooms} alt="Rooms & Suites" fill className="object-cover" priority quality={85} />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/80 via-charcoal/50 to-charcoal/80" />
        <div className="relative container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.2 }}>
            <SectionLabel label="Accommodation" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.4 }}
            className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Rooms &amp;{" "}
            <span className="bg-gradient-to-r from-gold to-gold-dark bg-clip-text text-transparent">Suites</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.6 }}
            className="text-base md:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            From cozy shared rooms to premium air-conditioned suites — find the
            perfect space for your stay.
          </motion.p>
        </div>
      </section>

      {/* Filter + Cards */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="container mx-auto px-6">
          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-full text-[12px] font-semibold tracking-wide transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-charcoal text-white shadow-lg shadow-charcoal/20"
                    : "bg-white text-neutral-500 hover:text-charcoal border border-neutral-200 hover:border-neutral-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Room Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {filteredRooms.map((room, i) => (
              <FadeIn key={room.slug} delay={i * 0.08}>
                <div className="group bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={IMAGES.rooms[room.slug as keyof typeof IMAGES.rooms]}
                      alt={room.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {room.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 bg-gold text-charcoal text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">
                          <Star className="h-3 w-3 fill-current" />Premium
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-white/90 backdrop-blur-sm text-charcoal text-sm font-bold px-3 py-1.5 rounded-lg">
                        GH₵ {room.price}<span className="text-neutral-400 text-xs font-normal"> /night</span>
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-charcoal mb-2">{room.name}</h3>
                    <div className="flex items-center gap-4 text-xs text-neutral-400 mb-3">
                      <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{room.capacity} Guests</span>
                      <span className="flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5" />{room.beds} Beds</span>
                      <span className="flex items-center gap-1.5"><Maximize className="h-3.5 w-3.5" />{room.capacity <= 2 ? "30" : room.capacity <= 4 ? "45" : "60"}m²</span>
                    </div>
                    <p className="text-sm text-neutral-500 leading-relaxed mb-4">{room.description}</p>
                    <Link href="/booking">
                      <Button size="sm" className="w-full bg-charcoal hover:bg-charcoal-light text-white text-xs h-9 tracking-wide">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Halls */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <SectionLabel label="Event Spaces" />
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-charcoal mb-3">Conference &amp; Event Halls</h2>
            <p className="text-neutral-500 text-sm">Versatile spaces for worship, conferences, weddings, and special events.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {HALLS.map((hall, i) => {
              const venueImages = [IMAGES.venues.faithHall, IMAGES.venues.pavilion, IMAGES.venues.diningHall];
              return (
                <FadeIn key={hall.name} delay={i * 0.1}>
                  <div className="group bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                    <div className="relative h-52 overflow-hidden">
                      <Image src={venueImages[i] ?? venueImages[0]} alt={hall.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-charcoal text-xs font-semibold px-3 py-1.5 rounded-full">
                        <Users className="h-3 w-3" />{hall.capacity}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-[family-name:var(--font-playfair)] text-base font-bold text-charcoal mb-2">{hall.name}</h3>
                      <p className="text-sm text-neutral-500 leading-relaxed">{hall.description}</p>
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
