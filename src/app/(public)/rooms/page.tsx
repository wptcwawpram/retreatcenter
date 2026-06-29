"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROOMS, HALLS, ADDITIONAL_ROOMS } from "@/lib/site-data";
import { IMAGES } from "@/lib/images";
import {
  BedDouble,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
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

export default function RoomsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative text-white py-28 md:py-36 overflow-hidden">
        <Image
          src={IMAGES.hero.rooms}
          alt="Elegant hotel room"
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
              Accommodation
              <span className="w-8 h-px bg-current" />
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.4 }}
            className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Our{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              Rooms & Suites
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.6 }}
            className="text-base md:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
            From affordable shared rooms to premium executive suites &mdash; we have
            the perfect accommodation for every guest and budget.
          </motion.p>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {ROOMS.map((room, i) => (
              <FadeIn key={room.slug} delay={i * 0.1}>
                <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={SPRING_SNAPPY}>
                  <Card
                    className={`group overflow-hidden border-0 ring-0 shadow-md hover:shadow-2xl hover:shadow-stone-900/10 transition-shadow duration-300 ${
                      room.featured
                        ? "ring-2 ring-amber-400 relative"
                        : "hover:ring-1 hover:ring-amber-200"
                    }`}
                  >
                {room.featured && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-amber-500 text-white border-0 gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Premium
                    </Badge>
                  </div>
                )}

                {/* Room image */}
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={IMAGES.rooms[room.slug as keyof typeof IMAGES.rooms]}
                    alt={room.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-amber-800 text-sm font-bold px-3 py-1.5 rounded-lg">
                      GH₵{room.price}
                      <span className="text-xs font-normal text-gray-500">/ night</span>
                    </span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-stone-900 mb-2 group-hover:text-amber-700 transition-colors">
                    {room.name}
                  </h3>

                  <div className="flex items-center gap-4 mb-4 text-sm text-stone-500">
                    <span className="flex items-center gap-1.5">
                      <BedDouble className="h-4 w-4 text-amber-600" />
                      {room.beds} Beds
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-amber-600" />
                      Up to {room.capacity} guests
                    </span>
                  </div>

                  <p className="text-sm text-stone-500 leading-relaxed mb-5">
                    {room.description}
                  </p>

                  {/* all amenities */}
                  <div className="space-y-2 mb-6">
                    {room.amenities.map((a) => (
                      <div key={a} className="flex items-center gap-2 text-sm text-stone-600">
                        <CheckCircle className="h-4 w-4 text-amber-500 shrink-0" />
                        {a}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <Link href="/booking" className="block">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={SPRING_SNAPPY}>
                        <Button className="w-full bg-stone-900 hover:bg-stone-800 text-white gap-1.5">
                          Book Now
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </CardContent>
                  </Card>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Rooms & Facilities */}
      <section className="py-20 md:py-28 bg-stone-50">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase mb-4 text-amber-600">
              <span className="w-8 h-px bg-current" />
              More Options
              <span className="w-8 h-px bg-current" />
            </span>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Additional Rooms & Facilities
            </h2>
            <p className="text-stone-500 max-w-xl mx-auto text-base leading-relaxed">
              Extra accommodation and facility options available for your stay.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {ADDITIONAL_ROOMS.map((room, i) => (
              <FadeIn key={room.name} delay={i * 0.08}>
                <motion.div whileHover={{ y: -4 }} transition={SPRING_SNAPPY}>
                  <Card className="group border-0 ring-0 shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full">
                    <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
                <CardContent className="p-5">
                  <h3 className="font-[family-name:var(--font-playfair)] font-bold text-stone-900 mb-3 group-hover:text-amber-700 transition-colors">
                    {room.name}
                  </h3>
                  <div className="space-y-2 text-sm text-stone-500 mb-4">
                    {room.beds > 0 && (
                      <div className="flex items-center gap-1.5">
                        <BedDouble className="h-4 w-4 text-amber-500" />
                        {room.beds} Beds
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-amber-500" />
                      {room.capacity === 50 ? "Up to 50" : `Up to ${room.capacity}`} {room.capacity === 1 ? "user" : "guests"}
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <span className="text-xl font-bold text-stone-900">GH₵{room.price}</span>
                    <span className="text-sm text-stone-400 ml-1">/ night</span>
                  </div>
                </CardContent>
                  </Card>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Halls */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase mb-4 text-amber-600">
              <span className="w-8 h-px bg-current" />
              Event Venues
              <span className="w-8 h-px bg-current" />
            </span>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Conference & Event Halls
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {HALLS.map((hall, i) => {
              const venueImages = [IMAGES.venues.faithHall, IMAGES.venues.pavilion, IMAGES.venues.diningHall];
              return (
                <FadeIn key={hall.name} delay={i * 0.12}>
                  <motion.div whileHover={{ y: -6 }} transition={SPRING_SNAPPY}>
                    <Card className="group border-0 ring-0 shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Venue image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={venueImages[i] ?? venueImages[0]}
                      alt={hall.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <Badge className="absolute bottom-3 left-3 bg-white/90 text-amber-800 border-0 backdrop-blur-sm">
                      <Users className="h-3 w-3 mr-1" />
                      {hall.capacity}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-stone-900 mb-2">{hall.name}</h3>
                    <p className="text-sm text-stone-500 leading-relaxed">
                      {hall.description}
                    </p>
                  </CardContent>
                    </Card>
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
