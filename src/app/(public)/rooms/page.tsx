"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ROOMS, HALLS, ADDITIONAL_ROOMS } from "@/lib/site-data";
import { IMAGES } from "@/lib/images";
import { BedDouble, Users, Star, ArrowRight, Maximize } from "lucide-react";

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
      {/* Header */}
      <section className="pt-32 pb-10 bg-[#faf8f5]">
        <div className="container mx-auto px-6 text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 mb-3">
            Rooms &amp; Suites
          </h1>
          <p className="text-stone-500">Comfort that feels like home.</p>
        </div>
      </section>

      {/* Tabs + Room Cards */}
      <section className="py-12 md:py-16 bg-[#faf8f5]">
        <div className="container mx-auto px-6">
          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-green-800 text-white"
                    : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Room Cards — Horizontal Layout */}
          <div className="space-y-5 max-w-4xl mx-auto">
            {filteredRooms.map((room, i) => (
              <FadeIn key={room.slug} delay={i * 0.08}>
                <div className="group flex flex-col md:flex-row bg-white rounded-xl border border-stone-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Image */}
                  <div className="relative md:w-[300px] h-52 md:h-auto shrink-0 overflow-hidden">
                    <Image
                      src={IMAGES.rooms[room.slug as keyof typeof IMAGES.rooms]}
                      alt={room.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                    {room.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 bg-green-700 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">
                          <Star className="h-3 w-3 fill-current" />Premium
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-stone-900 mb-2">{room.name}</h3>
                      <div className="flex items-center gap-4 text-xs text-stone-400 mb-3">
                        <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{room.capacity} Guests</span>
                        <span className="flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5" />{room.beds} Beds</span>
                        <span className="flex items-center gap-1.5"><Maximize className="h-3.5 w-3.5" />{room.capacity <= 2 ? "30" : room.capacity <= 4 ? "45" : "60"}m²</span>
                      </div>
                      <p className="text-sm text-stone-500 leading-relaxed">{room.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
                      <div>
                        <span className="text-xl font-bold text-stone-900">GH₵ {room.price}</span>
                        <span className="text-xs text-stone-400 ml-1">/ night</span>
                      </div>
                      <Link href="/booking">
                        <Button size="sm" className="bg-green-800 hover:bg-green-700 text-white text-xs h-9 px-5">
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

      {/* Halls */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-stone-900 mb-2">Conference &amp; Event Halls</h2>
            <p className="text-stone-500 text-sm">Versatile spaces for worship, conferences, weddings, and special events.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {HALLS.map((hall, i) => {
              const venueImages = [IMAGES.venues.faithHall, IMAGES.venues.pavilion, IMAGES.venues.diningHall];
              return (
                <FadeIn key={hall.name} delay={i * 0.1}>
                  <div className="group bg-white rounded-xl border border-stone-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <Image src={venueImages[i] ?? venueImages[0]} alt={hall.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-stone-700 text-xs font-medium px-3 py-1 rounded-full">
                        <Users className="h-3 w-3" />{hall.capacity}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-[family-name:var(--font-playfair)] text-base font-bold text-stone-900 mb-2">{hall.name}</h3>
                      <p className="text-sm text-stone-500 leading-relaxed">{hall.description}</p>
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
