"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
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

function SectionLabel({ label, className }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center gap-4 mb-4 ${className ?? ""}`}>
      <span className="h-px w-8 bg-gold/40" />
      <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-gold">{label}</span>
      <span className="h-px w-8 bg-gold/40" />
    </div>
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
      <section className="relative text-white py-28 md:py-36 overflow-hidden">
        <Image src={IMAGES.hero.about} alt="About WPTC" fill className="object-cover" priority quality={85} />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/80 via-charcoal/50 to-charcoal/80" />
        <div className="relative container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.2 }}>
            <SectionLabel label="Our Story" className="justify-center" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.4 }}
            className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-gold to-gold-dark bg-clip-text text-transparent">Us</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.6 }}
            className="text-base md:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Raising Warriors. Building Destinies.
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-28 bg-ivory">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start max-w-6xl mx-auto">
            <FadeIn>
              <SectionLabel label="Who We Are" />
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-charcoal mb-6">
                A Sanctuary for Spiritual Renewal
              </h2>
              <div className="space-y-5">
                <p className="text-neutral-500 leading-relaxed">
                  Warriors Prayer Tower Complex is a Christian retreat center committed to
                  raising a generation of warriors through prayer, discipleship and divine encounters.
                </p>
                <p className="text-neutral-500 leading-relaxed">
                  We provide a serene atmosphere, world-class facilities and excellent
                  hospitality to make your stay a memorable one.
                </p>
                <p className="text-neutral-500 leading-relaxed">
                  Located in the peaceful community of Atwima Boko near Kumasi, Ghana,
                  our complex offers comfortable accommodation, modern conference halls,
                  a fully equipped kitchen and dining area, and beautiful outdoor spaces.
                  We are committed to making every guest feel welcomed with genuine Christian hospitality.
                </p>
              </div>
              <Link href="/rooms" className="mt-8 inline-block">
                <Button className="bg-charcoal hover:bg-charcoal-light text-white h-10 px-6 text-sm tracking-wide">
                  Explore Our Spaces
                </Button>
              </Link>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src={IMAGES.lifestyle.fellowship}
                  alt="Fellowship at WPTC"
                  width={600}
                  height={400}
                  className="w-full h-[350px] lg:h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-y border-neutral-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {STATS.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1} className="text-center">
                <div className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-charcoal mb-1">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-[11px] text-neutral-400 font-medium tracking-[0.15em] uppercase">{stat.label}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Scripture Quote */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <Image src={IMAGES.lifestyle.prayer} alt="Prayer" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-charcoal/75" />
        <div className="relative container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center max-w-5xl mx-auto">
            <FadeIn>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image src={IMAGES.hero.about} alt="WPTC Building" width={600} height={400} className="w-full h-[300px] object-cover" />
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-10 bg-gold/50" />
                <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-gold">Scripture</span>
              </div>
              <blockquote className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl text-white italic leading-relaxed mb-5">
                &ldquo;Arise, shine, for your light has come, and the glory of the Lord rises upon you.&rdquo;
              </blockquote>
              <p className="text-gold text-sm font-medium">&mdash; Isaiah 60:1</p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-ivory">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <SectionLabel label="Testimonials" className="justify-center" />
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-charcoal">
              What People Say
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.author} delay={i * 0.1}>
                <div className="bg-white rounded-xl p-7 shadow-sm border border-neutral-100 hover:shadow-lg transition-shadow duration-500">
                  <div className="flex gap-0.5 mb-5">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-gold">{t.author[0]}</span>
                    </div>
                    <p className="text-xs font-semibold text-charcoal">{t.author}</p>
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
          <FadeIn className="text-center mb-14">
            <SectionLabel label="Our Purpose" className="justify-center" />
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FadeIn>
              <div className="bg-ivory rounded-xl p-8 h-full border border-neutral-100">
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-charcoal mb-4">Our Mission</h3>
                <p className="text-neutral-500 leading-relaxed">
                  To provide a serene, well-equipped retreat environment where individuals and groups
                  can experience spiritual upliftment, personal growth, and deeper fellowship with God and one another.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="bg-ivory rounded-xl p-8 h-full border border-neutral-100">
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-charcoal mb-4">Our Vision</h3>
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
