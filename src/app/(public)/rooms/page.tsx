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
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={{ ...SPRING, delay }} className={className}>
      {children}
    </motion.div>
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
      <section className="relative h-[45vh] min-h-[320px] overflow-hidden bg-neutral-900">
        <Image src={IMAGES.hero.rooms} alt="Rooms & Suites" fill className="object-cover" priority quality={85} />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative h-full flex items-center justify-center text-center">
          <div>
            <p className="text-burnt-light text-xs font-bold tracking-[0.2em] uppercase mb-3">Accommodation</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
              Rooms & Suites
            </h1>
            <p className="text-white/60 text-base max-w-lg mx-auto">
              From cozy shared rooms to premium air-conditioned suites — find the perfect space for your stay.
            </p>
          </div>
        </div>
      </section>

      {/* Filter + Cards */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-full text-[12px] font-semibold tracking-wide transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-burnt text-white shadow-md shadow-burnt/20"
                    : "bg-neutral-50 text-neutral-500 hover:text-neutral-800 border border-neutral-200 hover:border-neutral-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {filteredRooms.map((room, i) => (
              <FadeIn key={room.slug} delay={i * 0.06}>
                <div className="group bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={IMAGES.rooms[room.slug as keyof typeof IMAGES.rooms]}
                      alt={room.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    {room.featured && (
                      <span className="absolute top-3 left-3 bg-burnt text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md">
                        <Star className="h-3 w-3 fill-current inline mr-1" />Premium
                      </span>
                    )}
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-white/90 backdrop-blur-sm text-neutral-900 text-sm font-bold px-3 py-1.5 rounded-lg">
                        GH₵ {room.price}<span className="text-neutral-400 text-xs font-normal"> /night</span>
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-[family-name:var(--font-playfair)] text-base font-bold text-neutral-900 mb-1.5">{room.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-neutral-400 mb-3">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{room.capacity} Guests</span>
                      <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{room.beds} Beds</span>
                      <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{room.capacity <= 2 ? "30" : room.capacity <= 4 ? "45" : "60"}m²</span>
                    </div>
                    <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2 mb-4">{room.description}</p>
                    <Link href="/booking">
                      <Button size="sm" className="w-full bg-burnt hover:bg-burnt-dark text-white text-xs h-9">
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
      <section className="py-16 md:py-20 bg-cream">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <p className="text-burnt text-xs font-bold tracking-[0.2em] uppercase mb-3">Event Spaces</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-neutral-900 mb-2">Conference & Event Halls</h2>
            <p className="text-neutral-500 text-sm">Versatile spaces for worship, conferences, weddings, and special events.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {HALLS.map((hall, i) => {
              const venueImages = [IMAGES.venues.faithHall, IMAGES.venues.pavilion, IMAGES.venues.diningHall];
              return (
                <FadeIn key={hall.name} delay={i * 0.1}>
                  <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500">
                    <div className="relative h-48 overflow-hidden">
                      <Image src={venueImages[i] ?? venueImages[0]} alt={hall.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-neutral-800 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                        <Users className="h-3 w-3" />{hall.capacity}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-[family-name:var(--font-playfair)] text-base font-bold text-neutral-900 mb-2">{hall.name}</h3>
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
