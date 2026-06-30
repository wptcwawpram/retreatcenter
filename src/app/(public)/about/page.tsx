"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site-data";
import { IMAGES } from "@/lib/images";
import { Star } from "lucide-react";

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
      {/* Header */}
      <section className="pt-32 pb-10 bg-[#faf8f5]">
        <div className="container mx-auto px-6 text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 mb-3">
            About Us
          </h1>
          <p className="text-stone-500">Raising Warriors. Building Destinies.</p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-20 bg-[#faf8f5]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
            <FadeIn>
              <div className="prose prose-stone max-w-none">
                <p className="text-stone-600 leading-relaxed mb-5">
                  Warriors Prayer Tower Complex is a Christian retreat center committed to
                  raising a generation of warriors through prayer, discipleship and divine encounters.
                </p>
                <p className="text-stone-600 leading-relaxed mb-5">
                  We provide a serene atmosphere, world class facilities and excellent
                  hospitality to make your stay a memorable one.
                </p>
                <p className="text-stone-600 leading-relaxed mb-8">
                  Located in the peaceful community of Atwima Boko near Kumasi, Ghana,
                  our complex offers comfortable accommodation, modern conference halls,
                  a fully equipped kitchen and dining area, and beautiful outdoor spaces.
                  We are committed to making every guest feel welcomed with genuine Christian hospitality.
                </p>
                <Link href="/about#mission">
                  <Button className="bg-green-800 hover:bg-green-700 text-white h-10 px-6 text-sm">
                    Our Mission &amp; Vision
                  </Button>
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={IMAGES.lifestyle.fellowship}
                  alt="Fellowship at WPTC"
                  width={600}
                  height={400}
                  className="w-full h-[350px] lg:h-[400px] object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-14 bg-white border-y border-stone-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {STATS.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1} className="text-center">
                <div className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-green-800 mb-1">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs text-stone-500 font-medium tracking-wide uppercase">{stat.label}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Scripture Quote */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <Image src={IMAGES.lifestyle.prayer} alt="Prayer" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-green-950/70" />
        <div className="relative container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <FadeIn>
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <Image src={IMAGES.hero.about} alt="WPTC Building" width={600} height={400} className="w-full h-[300px] object-cover" />
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <blockquote className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl text-white italic leading-relaxed mb-4">
                &ldquo;Arise, shine, for your light has come, and the glory of the Lord rises upon you.&rdquo;
              </blockquote>
              <p className="text-amber-500 text-sm font-medium">&mdash; Isaiah 60:1</p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-[#faf8f5]">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-stone-900 mb-2">
              What People Say
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.author} delay={i * 0.1}>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                  <p className="text-xs font-semibold text-stone-800">&mdash; {t.author}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="mission" className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FadeIn>
              <div className="bg-[#faf8f5] rounded-xl p-8 h-full">
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-stone-900 mb-4">Our Mission</h3>
                <p className="text-stone-500 leading-relaxed">
                  To provide a serene, well-equipped retreat environment where individuals and groups
                  can experience spiritual upliftment, personal growth, and deeper fellowship with God and one another.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="bg-[#faf8f5] rounded-xl p-8 h-full">
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-stone-900 mb-4">Our Vision</h3>
                <p className="text-stone-500 leading-relaxed">
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
