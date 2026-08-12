"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { IMAGES } from "@/lib/images";
import { SITE } from "@/lib/site-data";
import { ArrowRight, BookOpen, Heart, Users, Shield, Star, Church } from "lucide-react";

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

const VALUES = [
  { icon: BookOpen, title: "Faith-Centred", desc: "Every service and space is designed to draw you closer to God." },
  { icon: Heart, title: "Genuine Love", desc: "We serve with the love of Christ, treating every guest as family." },
  { icon: Shield, title: "Excellence", desc: "Premium facilities and attention to detail in everything we do." },
  { icon: Users, title: "Community", desc: "A place where believers gather, fellowship, and grow together." },
  { icon: Star, title: "Integrity", desc: "Honest, transparent service rooted in Christian values." },
  { icon: Church, title: "Ministry", desc: "More than hospitality — a ministry of spiritual renewal." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] overflow-hidden bg-luxury">
        <Image src={IMAGES.hero.about} alt="About Us" fill className="object-cover" priority quality={85} />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative h-full flex items-center justify-center text-center">
          <div>
            <div className="w-10 h-px bg-gold mx-auto mb-5" />
            <p className="text-gold/60 text-[11px] tracking-[0.2em] uppercase mb-3">Our Story</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white mb-4">
              About Us
            </h1>
            <p className="text-warm-muted text-base max-w-2xl mx-auto">
              A decade of dedicated service as Ghana&rsquo;s premier Christian retreat centre.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 md:py-32 bg-luxury">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            <FadeIn>
              <div className="relative">
                <div className="overflow-hidden">
                  <Image src={IMAGES.lifestyle.fellowship} alt="Our Community" width={600} height={500} className="w-full h-[460px] object-cover" />
                </div>
                <div className="absolute -bottom-5 -right-5 w-[180px] h-[140px] overflow-hidden border border-gold/15 hidden lg:block">
                  <Image src={IMAGES.lifestyle.prayer} alt="Prayer" fill className="object-cover" />
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="text-gold/60 text-[11px] tracking-[0.2em] uppercase mb-4">Who We Are</p>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-warm-white mb-5 leading-tight">
                Warriors Prayer Tower Complex
              </h2>
              <div className="w-12 h-px bg-gold/30 mb-6" />
              <p className="text-warm-muted leading-relaxed mb-4">
                {SITE.name} ({SITE.subtitle}) is a premier Christian retreat and conference centre nestled in the tranquil community of Atwima Boko, Kumasi, Ghana.
              </p>
              <p className="text-warm-muted leading-relaxed mb-4">
                For over a decade, we have provided a serene and spiritually-charged environment for individuals, families, churches, and organizations seeking a place to retreat, pray, fellowship, and encounter God.
              </p>
              <p className="text-warm-muted leading-relaxed mb-8">
                Our mission is simple: to provide a place of refuge where the weary find rest, the seeking find God, and the called find clarity. Every room, garden path, and gathering space has been designed with this purpose in mind.
              </p>
              <Link href="/contact">
                <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 gap-2 font-medium tracking-[0.1em] uppercase text-[11px] h-11 px-6">
                  Get In Touch <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-luxury-card border-y border-gold/8">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-xl mx-auto">
            <FadeIn>
              <p className="text-gold/60 text-[11px] tracking-[0.2em] uppercase mb-4">What Guides Us</p>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-warm-white mb-4">
                Our Values
              </h2>
              <div className="w-12 h-px bg-gold/30 mx-auto" />
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {VALUES.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.06}>
                <div className="border border-gold/8 p-7 hover:border-gold/20 transition-colors duration-300">
                  <v.icon className="h-5 w-5 text-gold/60 mb-4" />
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-warm-white mb-2">{v.title}</h3>
                  <p className="text-sm text-warm-muted leading-relaxed">{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Scripture */}
      <section className="relative py-28 overflow-hidden">
        <Image src={IMAGES.gallery.grounds[1]} alt="Grounds" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative container mx-auto px-6 text-center max-w-3xl">
          <FadeIn>
            <div className="w-8 h-px bg-gold mx-auto mb-8" />
            <blockquote className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl lg:text-3xl text-warm-white italic leading-relaxed mb-6">
              &ldquo;They that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.&rdquo;
            </blockquote>
            <p className="text-gold text-sm tracking-[0.1em]">&mdash; Isaiah 40:31</p>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-luxury">
        <div className="container mx-auto px-6 text-center">
          <FadeIn>
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-warm-white mb-4">
              Experience WPTC for Yourself
            </h3>
            <p className="text-warm-muted mb-8 max-w-md mx-auto">Plan your visit today and discover why thousands have chosen us for their retreats.</p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/booking">
                <Button className="bg-gold text-luxury hover:bg-gold-bright font-semibold h-11 px-8 text-[11px] tracking-[0.12em] uppercase">
                  Book Your Stay
                </Button>
              </Link>
              <Link href="/gallery">
                <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 h-11 px-8 text-[11px] tracking-[0.12em] uppercase gap-2">
                  View Gallery <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
