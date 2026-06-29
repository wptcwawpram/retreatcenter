"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { IMAGES } from "@/lib/images";
import { Camera } from "lucide-react";

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

const GALLERY_SECTIONS = [
  {
    title: "Accommodation",
    description: "Our comfortable rooms and suites",
    images: IMAGES.gallery.accommodation,
  },
  {
    title: "Faith Hall & Pavilion",
    description: "Conference and worship venues",
    images: IMAGES.gallery.venues,
  },
  {
    title: "Grounds & Gardens",
    description: "Our serene, lush environment",
    images: IMAGES.gallery.grounds,
  },
  {
    title: "Dining & Kitchen",
    description: "Where meals and fellowship happen",
    images: IMAGES.gallery.dining,
  },
  {
    title: "Events & Retreats",
    description: "Memorable moments at WPTC",
    images: IMAGES.gallery.events,
  },
  {
    title: "The Complex",
    description: "Aerial and exterior views",
    images: IMAGES.gallery.exterior,
  },
];

export default function GalleryPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative text-white py-28 md:py-36 overflow-hidden">
        <Image
          src={IMAGES.hero.gallery}
          alt="WPTC Gallery"
          fill
          className="object-cover"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/80 via-green-950/50 to-green-950/80" />
        <div className="relative container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.2 }}>
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase mb-4 text-amber-500">
              <Camera className="h-3.5 w-3.5" />
              Gallery
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.4 }}
            className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Photo{" "}
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
              Gallery
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.6 }}
            className="text-base md:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Take a visual tour of Warriors Prayer Tower Complex and see what
            awaits you.
          </motion.p>
        </div>
      </section>

      {/* Gallery Sections */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-20">
            {GALLERY_SECTIONS.map((section) => (
              <FadeIn key={section.title}>
                <div className="mb-8">
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-stone-900 mb-2">
                    {section.title}
                  </h2>
                  <p className="text-stone-500">{section.description}</p>
                </div>

                {/* Masonry-style grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {section.images.map((src, i) => (
                    <div
                      key={i}
                      className={`group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ${
                        i === 0 ? "col-span-2 row-span-2 h-[300px] md:h-[400px]" : "h-[200px]"
                      }`}
                    >
                      <Image
                        src={src}
                        alt={`${section.title} - Photo ${i + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes={i === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 50vw, 33vw"}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  ))}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
