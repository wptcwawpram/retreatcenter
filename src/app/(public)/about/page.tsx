"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { IMAGES } from "@/lib/images";
import { Star, ArrowRight } from "lucide-react";

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

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

const STATS = [
  { value: 10, suffix: "+", label: "Years of Impact" },
  { value: 30, suffix: "+", label: "Rooms" },
  { value: 5, suffix: "+", label: "Conference Halls" },
  { value: 1000, suffix: "+", label: "Lives Touched" },
];

const TESTIMONIALS = [
  { text: "A place where heaven meets earth. My life will never be the same!", author: "Diana A.", stars: 5 },
  { text: "The best retreat experience I have ever had. Highly recommended!", author: "Kofi M.", stars: 5 },
  { text: "The atmosphere is so peaceful and the hospitality top notch.", author: "Ama S.", stars: 5 },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[45vh] min-h-[320px] overflow-hidden bg-neutral-900">
        <Image src={IMAGES.hero.about} alt="About WPTC" fill className="object-cover" priority quality={85} />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative h-full flex items-center justify-center text-center">
          <div>
            <p className="text-burnt-light text-xs font-bold tracking-[0.2em] uppercase mb-3">Our Story</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">About Us</h1>
            <p className="text-white/60 text-base">Raising Warriors. Building Destinies.</p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center max-w-6xl mx-auto">
            <FadeIn>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <Image src={IMAGES.lifestyle.fellowship} alt="Fellowship at WPTC" width={600} height={450} className="w-full h-[400px] object-cover" />
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-burnt text-xs font-bold tracking-[0.2em] uppercase mb-3">Who We Are</p>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-neutral-900 mb-6">
                A Sanctuary for Spiritual Renewal
              </h2>
              <div className="space-y-4 text-neutral-500 leading-relaxed">
                <p>Warriors Prayer Tower Complex is a Christian retreat center committed to raising a generation of warriors through prayer, discipleship and divine encounters.</p>
                <p>We provide a serene atmosphere, world-class facilities and excellent hospitality to make your stay a memorable one.</p>
                <p>Located in the peaceful community of Atwima Boko near Kumasi, Ghana, our complex offers comfortable accommodation, modern conference halls, a fully equipped kitchen and dining area, and beautiful outdoor spaces.</p>
              </div>
              <Link href="/rooms" className="mt-8 inline-block">
                <Button className="bg-burnt hover:bg-burnt-dark text-white font-semibold gap-2">
                  Explore Our Spaces <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-neutral-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {STATS.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.08} className="text-center">
                <div className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-burnt mb-1">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs text-white/50 font-medium tracking-wide uppercase">{stat.label}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Scripture */}
      <section className="relative py-24 overflow-hidden">
        <Image src={IMAGES.lifestyle.prayer} alt="Prayer" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center max-w-5xl mx-auto">
            <FadeIn>
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <Image src={IMAGES.hero.about} alt="WPTC Building" width={600} height={400} className="w-full h-[300px] object-cover" />
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <blockquote className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl text-white italic leading-relaxed mb-5">
                &ldquo;Arise, shine, for your light has come, and the glory of the Lord rises upon you.&rdquo;
              </blockquote>
              <p className="text-burnt-light text-sm font-semibold">&mdash; Isaiah 60:1</p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <p className="text-burnt text-xs font-bold tracking-[0.2em] uppercase mb-3">Testimonials</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-neutral-900">
              What People Say
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.author} delay={i * 0.1}>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-burnt text-burnt" />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-burnt/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-burnt">{t.author[0]}</span>
                    </div>
                    <p className="text-xs font-semibold text-neutral-800">{t.author}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="mission" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <p className="text-burnt text-xs font-bold tracking-[0.2em] uppercase mb-3">Our Purpose</p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <FadeIn>
              <div className="bg-cream rounded-xl p-8 h-full border border-neutral-100">
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-neutral-900 mb-4">Our Mission</h3>
                <p className="text-neutral-500 leading-relaxed">
                  To provide a serene, well-equipped retreat environment where individuals and groups
                  can experience spiritual upliftment, personal growth, and deeper fellowship with God and one another.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="bg-cream rounded-xl p-8 h-full border border-neutral-100">
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-neutral-900 mb-4">Our Vision</h3>
                <p className="text-neutral-500 leading-relaxed">
                  To become the leading Christian retreat centre in West Africa, known for excellence
                  in hospitality, spiritual impact, and creating life-transforming experiences for every guest.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
