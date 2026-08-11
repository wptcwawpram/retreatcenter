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

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-4">
      <span className="h-px w-8 bg-gold/40" />
      <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-gold">{label}</span>
      <span className="h-px w-8 bg-gold/40" />
    </div>
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
      {/* Hero */}
      <section className="relative text-white py-28 md:py-36 overflow-hidden">
        <Image src={IMAGES.hero.packages} alt="Retreat Packages" fill className="object-cover" priority quality={85} />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/80 via-charcoal/50 to-charcoal/80" />
        <div className="relative container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.2 }}>
            <SectionLabel label="Packages" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.4 }}
            className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Retreat{" "}
            <span className="bg-gradient-to-r from-gold to-gold-dark bg-clip-text text-transparent">Packages</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.6 }}
            className="text-base md:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Specially curated packages for your retreat, conference or spiritual programs.
          </motion.p>
        </div>
      </section>

      {/* Tabs + Cards */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="container mx-auto px-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {filtered.map((pkg, i) => (
              <FadeIn key={pkg.name} delay={i * 0.08}>
                <div className="group bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                  <div className="relative h-52 overflow-hidden">
                    <Image src={pkg.image} alt={pkg.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 50vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-white/90 backdrop-blur-sm text-charcoal text-sm font-bold px-3 py-1.5 rounded-lg">
                        {pkg.price}<span className="text-neutral-400 text-xs font-normal"> {pkg.priceSuffix}</span>
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-charcoal mb-2">{pkg.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mb-3">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{pkg.guests}</span>
                      {pkg.duration && <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{pkg.duration}</span>}
                      {pkg.board && <span className="flex items-center gap-1"><UtensilsCrossed className="h-3.5 w-3.5" />{pkg.board}</span>}
                    </div>
                    <p className="text-sm text-neutral-500 leading-relaxed mb-4">{pkg.description}</p>
                    <Link href="/contact">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-charcoal hover:text-gold transition-colors group/link">
                        View Details <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                      </span>
                    </Link>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Package CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <FadeIn>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-3xl mx-auto bg-charcoal text-white rounded-xl p-8">
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold mb-1">Need a Custom Package?</h3>
                <p className="text-neutral-400 text-sm">We can tailor a package to match your group size, budget, and requirements.</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link href="/contact">
                  <Button className="bg-gold hover:bg-gold-dark text-charcoal text-sm h-10 px-5 font-semibold">
                    Contact Us <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-sm h-10 px-5">
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
