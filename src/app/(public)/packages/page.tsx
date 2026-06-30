"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { IMAGES } from "@/lib/images";
import { Users, CalendarDays, ArrowRight, UtensilsCrossed, Phone } from "lucide-react";
import { SITE } from "@/lib/site-data";

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

const TABS = ["All Packages", "Personal Retreat", "Church Retreat", "Conference"] as const;

const PACKAGES = [
  {
    name: "Personal Retreat",
    category: "Personal Retreat",
    image: IMAGES.lifestyle.prayer,
    guests: "1 - 2 Guests",
    duration: "2 Days 1 Night",
    board: null,
    description: "A private retreat to refresh your spirit, mind and body.",
    price: "GH₵ 800",
    priceSuffix: "/ package",
  },
  {
    name: "Couples Retreat",
    category: "Personal Retreat",
    image: IMAGES.lifestyle.family,
    guests: "2 Guests",
    duration: "2 Days 1 Night",
    board: null,
    description: "A special getaway for couples to reconnect and grow together.",
    price: "GH₵ 1,500",
    priceSuffix: "/ package",
  },
  {
    name: "Church Retreat",
    category: "Church Retreat",
    image: IMAGES.venues.faithHall,
    guests: "10+ Guests",
    duration: "3 Days 2 Nights",
    board: null,
    description: "Perfect for church groups seeking spiritual renewal and fellowship.",
    price: "GH₵ 4,000+",
    priceSuffix: "/ package",
  },
  {
    name: "Conference Package",
    category: "Conference",
    image: IMAGES.gallery.venues[3],
    guests: "20+ Guests",
    duration: null,
    board: "Full Board",
    description: "Ideal for conferences, seminars and large gatherings.",
    price: "GH₵ 6,000+",
    priceSuffix: "/ package",
  },
];

export default function PackagesPage() {
  const [activeTab, setActiveTab] = useState<string>("All Packages");

  const filtered = PACKAGES.filter((pkg) => {
    if (activeTab === "All Packages") return true;
    return pkg.category === activeTab;
  });

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-10 bg-[#faf8f5]">
        <div className="container mx-auto px-6 text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 mb-3">
            Retreat Packages
          </h1>
          <p className="text-stone-500">Specially curated packages for your retreat, conference or spiritual programs.</p>
        </div>
      </section>

      {/* Tabs + Package Cards */}
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

          {/* Package Cards */}
          <div className="space-y-5 max-w-4xl mx-auto">
            {filtered.map((pkg, i) => (
              <FadeIn key={pkg.name} delay={i * 0.08}>
                <div className="group flex flex-col md:flex-row bg-white rounded-xl border border-stone-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative md:w-[280px] h-52 md:h-auto shrink-0 overflow-hidden">
                    <Image src={pkg.image} alt={pkg.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 280px" />
                  </div>
                  <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-stone-900 mb-2">{pkg.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 mb-3">
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{pkg.guests}</span>
                        {pkg.duration && <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{pkg.duration}</span>}
                        {pkg.board && <span className="flex items-center gap-1"><UtensilsCrossed className="h-3.5 w-3.5" />{pkg.board}</span>}
                      </div>
                      <p className="text-sm text-stone-500 leading-relaxed">{pkg.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
                      <div>
                        <span className="text-xl font-bold text-stone-900">{pkg.price}</span>
                        <span className="text-xs text-stone-400 ml-1">{pkg.priceSuffix}</span>
                      </div>
                      <Link href="/contact">
                        <span className="text-sm font-medium text-green-700 hover:text-green-600 flex items-center gap-1 transition-colors">
                          View Details <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Package CTA */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-6">
          <FadeIn>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-3xl mx-auto bg-green-950 text-white rounded-xl p-8">
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold mb-1">Need a Custom Package?</h3>
                <p className="text-green-200/70 text-sm">We can tailor a package to match your group size, budget, and requirements.</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link href="/contact">
                  <Button className="bg-white text-green-900 hover:bg-green-50 text-sm h-10 px-5">
                    Contact Us <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 text-sm h-10 px-5">
                    <Phone className="h-3.5 w-3.5 mr-1" /> Call Us
                  </Button>
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
