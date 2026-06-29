"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SITE } from "@/lib/site-data";
import { IMAGES } from "@/lib/images";
import {
  Heart,
  BookOpen,
  Users,
  Shield,
  Target,
  Eye,
} from "lucide-react";

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

function SlideIn({ children, className, direction = "left", delay = 0 }: { children: ReactNode; className?: string; direction?: "left" | "right"; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const x = direction === "left" ? -60 : 60;
  return (
    <motion.div ref={ref} initial={{ opacity: 0, x }} animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x }} transition={{ ...SPRING, delay }} className={className}>
      {children}
    </motion.div>
  );
}

const values = [
  {
    icon: Heart,
    title: "Hospitality",
    description:
      "Every guest is treated with warmth, dignity, and genuine Christian love throughout their stay.",
  },
  {
    icon: BookOpen,
    title: "Spiritual Growth",
    description:
      "We provide an atmosphere that nurtures prayer, worship, and deeper connection with God.",
  },
  {
    icon: Shield,
    title: "Excellence",
    description:
      "We maintain high standards in our facilities, services, and guest experience.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We foster fellowship and unity among believers from all denominations and backgrounds.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative text-white py-28 md:py-36 overflow-hidden">
        <Image
          src={IMAGES.hero.about}
          alt="Warriors Prayer Tower Complex"
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
              About Us
              <span className="w-8 h-px bg-current" />
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.4 }}
            className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              {SITE.shortName}
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.6 }}
            className="text-base md:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
            {SITE.subtitle} &mdash; providing a serene haven for spiritual renewal,
            conferences, and family retreats in the heart of Kumasi, Ghana.
          </motion.p>
        </div>
      </section>

      {/* Story — with side image */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            {/* Image side */}
            <SlideIn direction="left">
              <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl shadow-stone-900/10">
                <Image
                  src={IMAGES.lifestyle.fellowship}
                  alt="Fellowship at WPTC"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-950/20 to-transparent" />
                <div className="absolute -top-3 -right-3 w-24 h-24 border-t-2 border-r-2 border-amber-400/40 rounded-tr-2xl" />
              </div>
            </SlideIn>

            {/* Text side */}
            <SlideIn direction="right" delay={0.15}>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase mb-4 text-amber-600">
                <span className="w-8 h-px bg-current" />
                Our Story
              </span>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-stone-900 mb-6">
                A Place to Wait on God
              </h2>
              <div className="prose prose-lg max-w-none text-stone-500 space-y-6">
                <p>
                  Warriors Prayer Tower Complex, also known as Daniels&rsquo; Christian
                  Centre, was established to provide a dedicated space where
                  believers can retreat from the demands of everyday life and
                  draw closer to God in prayer, worship, and fellowship.
                </p>
                <p>
                  Located in the serene community of Atwima Boko near Kumasi, Ghana,
                  our complex offers a peaceful and secure environment for
                  individuals, families, churches, and organisations seeking
                  spiritual renewal. Whether you are planning a major conference,
                  an intimate bible study retreat, or simply a personal getaway to
                  reconnect with your faith, WPTC is your home away from home.
                </p>
                <p>
                  Our facilities include comfortable accommodation for groups of
                  all sizes, modern conference halls, a fully equipped kitchen and
                  dining area, and beautiful outdoor spaces. We are committed to
                  making every guest feel welcomed and cared for with genuine
                  Christian hospitality.
                </p>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-28 bg-stone-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FadeIn>
              <Card className="border-0 ring-0 shadow-lg overflow-hidden h-full">
                <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 mb-5">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-stone-900 mb-4">
                    Our Mission
                  </h3>
                  <p className="text-stone-500 leading-relaxed">
                    To provide a serene, well-equipped retreat environment where
                    individuals and groups can experience spiritual upliftment,
                    personal growth, and deeper fellowship with God and one another.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
            <FadeIn delay={0.15}>
              <Card className="border-0 ring-0 shadow-lg overflow-hidden h-full">
                <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 mb-5">
                    <Eye className="h-6 w-6" />
                  </div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-stone-900 mb-4">
                    Our Vision
                  </h3>
                  <p className="text-stone-500 leading-relaxed">
                    To become the leading Christian retreat centre in West Africa,
                    known for excellence in hospitality, spiritual impact, and
                    creating life-transforming experiences for every guest.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Scenic divider */}
      <section className="relative h-[300px] md:h-[400px] overflow-hidden">
        <Image
          src={IMAGES.lifestyle.prayer}
          alt="Prayer and worship"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-amber-950/40" />
      </section>

      {/* Values */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase mb-4 text-amber-600">
              <span className="w-8 h-px bg-current" />
              What Guides Us
              <span className="w-8 h-px bg-current" />
            </span>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Our Core Values
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.1}>
                <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 200, damping: 25 }} className="text-center p-6 rounded-2xl border border-transparent hover:border-stone-100 hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 mb-5">
                    <v.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-[family-name:var(--font-playfair)] font-semibold text-stone-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    {v.description}
                  </p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
