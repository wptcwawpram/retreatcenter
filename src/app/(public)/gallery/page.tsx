"use client";

import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import { IMAGES } from "@/lib/images";
import { X } from "lucide-react";

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

const CATEGORIES = [
  { label: "All", key: "all" },
  { label: "Accommodation", key: "accommodation" },
  { label: "Venues", key: "venues" },
  { label: "Grounds", key: "grounds" },
  { label: "Dining", key: "dining" },
  { label: "Events", key: "events" },
] as const;

function getAllImages(category: string) {
  if (category === "all") {
    return [
      ...IMAGES.gallery.accommodation.map((src) => ({ src, cat: "Accommodation" })),
      ...IMAGES.gallery.venues.map((src) => ({ src, cat: "Venues" })),
      ...IMAGES.gallery.grounds.map((src) => ({ src, cat: "Grounds" })),
      ...IMAGES.gallery.dining.map((src) => ({ src, cat: "Dining" })),
      ...IMAGES.gallery.events.map((src) => ({ src, cat: "Events" })),
    ];
  }
  const imgs = IMAGES.gallery[category as keyof typeof IMAGES.gallery];
  if (!Array.isArray(imgs)) return [];
  return imgs.map((src) => ({ src, cat: category }));
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const images = getAllImages(activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] overflow-hidden bg-luxury">
        <Image src={IMAGES.hero.gallery} alt="Gallery" fill className="object-cover" priority quality={85} />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative h-full flex items-center justify-center text-center">
          <div>
            <div className="w-10 h-px bg-gold mx-auto mb-5" />
            <p className="text-gold/60 text-[11px] tracking-[0.2em] uppercase mb-3">Explore</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white mb-4">
              Gallery
            </h1>
            <p className="text-warm-muted text-base max-w-2xl mx-auto">
              A glimpse into the serene beauty of Warriors Prayer Tower Complex.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 md:py-28 bg-luxury">
        <div className="container mx-auto px-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-1 mb-14">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-5 py-2.5 text-[11px] tracking-[0.15em] uppercase transition-all duration-300 border ${
                  activeCategory === cat.key
                    ? "bg-gold/10 border-gold/40 text-gold"
                    : "border-gold/10 text-warm-muted hover:text-warm-white hover:border-gold/20"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-1 max-w-5xl mx-auto">
            {images.map((img, i) => (
              <FadeIn key={img.src} delay={Math.min(i * 0.03, 0.3)}>
                <button
                  onClick={() => setLightbox(img.src)}
                  className="block w-full mb-1 relative group overflow-hidden cursor-pointer"
                >
                  <Image
                    src={img.src}
                    alt={img.cat}
                    width={600}
                    height={400 + (i % 3) * 80}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] text-gold tracking-[0.15em] uppercase">{img.cat}</span>
                  </div>
                </button>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-6"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-6 right-6 w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[80vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox}
                alt="Gallery"
                width={1200}
                height={800}
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
