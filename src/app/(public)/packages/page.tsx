"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/lib/site-data";
import { IMAGES } from "@/lib/images";
import {
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Church,
  Phone,
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

const PACKAGES = [
  {
    name: "Day Retreat",
    subtitle: "For groups and churches",
    price: "Contact us",
    duration: "1 day",
    capacity: "10 - 200+",
    image: IMAGES.venues.faithHall,
    includes: [
      "Use of Faith Hall or Pavilion",
      "PA system and projector",
      "Seating arrangement",
      "Parking for all guests",
      "Cafeteria access (meals at extra cost)",
    ],
    featured: false,
  },
  {
    name: "Weekend Retreat",
    subtitle: "Most popular for church groups",
    price: "Contact us",
    duration: "2 - 3 days",
    capacity: "10 - 100+",
    image: IMAGES.lifestyle.prayer,
    includes: [
      "Accommodation (room of choice)",
      "Use of conference hall",
      "PA system and projector",
      "Breakfast, lunch & dinner",
      "Chaplaincy support available",
      "Parking for all guests",
      "Room service",
    ],
    featured: true,
  },
  {
    name: "Extended Retreat",
    subtitle: "For deeper spiritual engagement",
    price: "Contact us",
    duration: "4 - 7 days",
    capacity: "5 - 50+",
    image: IMAGES.lifestyle.fellowship,
    includes: [
      "Accommodation (room of choice)",
      "Full board meals",
      "Exclusive hall booking",
      "PA system and projector",
      "Chaplaincy & counselling",
      "Laundry service",
      "Parking for all guests",
      "Room service",
    ],
    featured: false,
  },
  {
    name: "Family Getaway",
    subtitle: "Perfect for family bonding",
    price: "Contact us",
    duration: "2 - 5 days",
    capacity: "2 - 10",
    image: IMAGES.lifestyle.family,
    includes: [
      "Executive Suite or Holy Family Apartment",
      "Full board meals",
      "Private kitchen access",
      "Serene garden access",
      "Parking",
      "Room service",
    ],
    featured: false,
  },
];

export default function PackagesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative text-white py-28 md:py-36 overflow-hidden">
        <Image
          src={IMAGES.hero.packages}
          alt="WPTC Retreat Packages"
          fill
          className="object-cover"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/80 via-green-950/50 to-green-950/80" />
        <div className="relative container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.2 }}>
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase mb-4 text-green-600">
              <span className="w-8 h-px bg-current" />
              Packages
              <span className="w-8 h-px bg-current" />
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.4 }}
            className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Retreat{" "}
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
              Packages
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.6 }}
            className="text-base md:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Customized packages for churches, organisations, families, and
            individuals. We tailor every retreat to your needs.
          </motion.p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {PACKAGES.map((pkg, i) => (
              <FadeIn key={pkg.name} delay={i * 0.1}>
                <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={SPRING_SNAPPY}>
                  <Card
                    className={`group overflow-hidden border-0 ring-0 shadow-md hover:shadow-2xl hover:shadow-green-900/10 transition-shadow duration-300 ${
                      pkg.featured
                        ? "ring-2 ring-green-600 relative"
                        : "hover:ring-1 hover:ring-green-200"
                    }`}
                  >
                    {pkg.featured && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-green-700 text-white border-0 gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={pkg.image}
                        alt={pkg.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white">{pkg.name}</h3>
                        <p className="text-sm text-green-200">{pkg.subtitle}</p>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-5 text-sm text-stone-500">
                        <span className="flex items-center gap-1.5">
                          <Church className="h-4 w-4 text-green-700" />
                          {pkg.duration}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-green-700" />
                          {pkg.capacity}
                        </span>
                      </div>

                      <div className="space-y-2.5 mb-6">
                        {pkg.includes.map((item) => (
                          <div key={item} className="flex items-start gap-2 text-sm text-stone-600">
                            <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                            {item}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <span className="text-lg font-bold text-green-800">
                          {pkg.price}
                        </span>
                        <Link href="/contact">
                          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={SPRING_SNAPPY}>
                            <Button className="bg-green-900 hover:bg-green-800 text-white gap-1.5">
                              Enquire
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

          {/* Custom package CTA */}
          <FadeIn className="max-w-2xl mx-auto mt-16 text-center">
            <Card className="border-0 ring-0 shadow-lg overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={IMAGES.lifestyle.wedding}
                  alt="Special events at WPTC"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 672px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-950/50 to-green-950/20" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
                  <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white mb-2">
                    Need a Custom Package?
                  </h3>
                  <p className="text-green-100/80 text-sm">
                    We can create a tailored retreat package to match your
                    group size, budget, and specific requirements.
                  </p>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/contact">
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={SPRING_SNAPPY}>
                      <Button className="bg-green-900 hover:bg-green-800 text-white gap-1.5">
                        Contact Us
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </Link>
                  <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={SPRING_SNAPPY}>
                      <Button variant="outline" className="border-green-300 text-green-800 hover:bg-green-50 gap-1.5">
                        <Phone className="h-4 w-4" />
                        {SITE.phone}
                      </Button>
                    </motion.div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
