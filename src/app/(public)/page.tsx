"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SITE, SERVICES, ROOMS, AMENITIES, HALLS } from "@/lib/site-data";
import { IMAGES } from "@/lib/images";
import {
  ArrowRight,
  BedDouble,
  Users,
  Star,
  Heart,
  BookOpen,
  UtensilsCrossed,
  Shirt,
  Zap,
  Car,
  TreePine,
  ChefHat,
  Store,
  Sofa,
  Church,
  Tent,
  Phone,
  MapPin,
  CheckCircle,
  Play,
  CalendarDays,
  Sparkles,
} from "lucide-react";

/* ── icon map ── */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, Heart, BedDouble, UtensilsCrossed, Shirt, Zap, Car, TreePine, ChefHat, Store, Sofa, Church, Tent,
};

/* ── spring config ── */
const SPRING_SMOOTH = { type: "spring" as const, stiffness: 80, damping: 20, mass: 0.8 };
const SPRING_SNAPPY = { type: "spring" as const, stiffness: 200, damping: 25, mass: 0.5 };

/* ── animation wrappers ── */
function FadeIn({ children, className, delay = 0, y = 30 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }} transition={{ ...SPRING_SMOOTH, delay }} className={className}>
      {children}
    </motion.div>
  );
}

function SlideIn({ children, className, delay = 0, direction = "left" }: { children: ReactNode; className?: string; delay?: number; direction?: "left" | "right" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const x = direction === "left" ? -60 : 60;
  return (
    <motion.div ref={ref} initial={{ opacity: 0, x }} animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x }} transition={{ ...SPRING_SMOOTH, delay }} className={className}>
      {children}
    </motion.div>
  );
}

function StaggerContainer({ children, className, stagger = 0.1 }: { children: ReactNode; className?: string; stagger?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger } } }} className={className}>
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 30, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { ...SPRING_SMOOTH } } }} className={className}>
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

/* ── Section heading component ── */
function SectionHeading({ eyebrow, title, description, light = false }: {
  eyebrow: string; title: string; description: string; light?: boolean;
}) {
  return (
    <FadeIn className="text-center mb-16">
      <span className={`inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase mb-4 ${light ? "text-amber-400" : "text-amber-600"}`}>
        <motion.span initial={{ width: 0 }} whileInView={{ width: 32 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="h-px bg-current inline-block" />
        {eyebrow}
        <motion.span initial={{ width: 0 }} whileInView={{ width: 32 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="h-px bg-current inline-block" />
      </span>
      <h2 className={`font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-bold mb-5 leading-tight ${light ? "text-white" : "text-stone-900"}`}>
        {title}
      </h2>
      <p className={`max-w-xl mx-auto text-base leading-relaxed ${light ? "text-stone-400" : "text-stone-500"}`}>
        {description}
      </p>
    </FadeIn>
  );
}

/* ── page ── */
export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImageY = useTransform(heroProgress, [0, 1], [0, 150]);
  const heroImageScale = useTransform(heroProgress, [0, 1], [1.05, 1.2]);
  const heroContentY = useTransform(heroProgress, [0, 1], [0, 60]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

  return (
    <>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[100vh] flex items-center text-white">
        <motion.div className="absolute inset-0" style={{ y: heroImageY, scale: heroImageScale }}>
          <Image
            src={IMAGES.hero.home}
            alt="Warriors Prayer Tower Complex"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </motion.div>
        {/* Layered overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/50 to-stone-950/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/40 to-transparent" />

        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <motion.div className="relative container mx-auto px-6 py-24 md:py-32 lg:py-40" style={{ y: heroContentY, opacity: heroOpacity }}>
          <div className="max-w-4xl">
            {/* Gold accent line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ ...SPRING_SMOOTH, delay: 0.3 }}
              className="h-[2px] bg-gradient-to-r from-amber-400 to-amber-500 mb-8"
            />

            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING_SMOOTH, delay: 0.4 }}
              className="text-xs font-semibold tracking-[0.3em] uppercase text-amber-400 mb-6"
            >
              Daniels&rsquo; Christian Retreat Centre
            </motion.p>

            {/* Main heading — Serif */}
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_SMOOTH, delay: 0.5 }}
              className="font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-8"
            >
              A Serene
              <br />
              <motion.span
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING_SMOOTH, delay: 0.65 }}
                className="inline-block bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent"
              >
                Retreat
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING_SMOOTH, delay: 0.8 }}
                className="inline-block text-white/90"
              >
                Experience
              </motion.span>
            </motion.h1>

            {/* Sub-text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_SMOOTH, delay: 0.9 }}
              className="text-base md:text-lg text-stone-300 max-w-lg mb-10 leading-relaxed"
            >
              {SITE.heroText}
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_SMOOTH, delay: 1.0 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <Link href="/booking">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={SPRING_SNAPPY}>
                  <Button size="lg" className="gap-2 min-w-[200px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold shadow-2xl shadow-amber-500/20 text-sm h-13 tracking-wide uppercase">
                    Reserve Your Stay
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/rooms">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={SPRING_SNAPPY}>
                  <Button size="lg" className="min-w-[200px] bg-transparent border border-white/20 text-white hover:bg-white/10 hover:border-white/40 font-medium text-sm h-13 tracking-wide uppercase backdrop-blur-sm">
                    Explore Rooms
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Trust strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              className="flex flex-wrap items-center gap-6 mt-14 text-xs text-stone-400 tracking-wide"
            >
              {["Peaceful & Secure", "24/7 Backup Power", "Free Parking", "Conference Halls"].map((text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SPRING_SMOOTH, delay: 1.4 + i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-3.5 w-3.5 text-amber-500/60" />
                  {text}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ═══════════════════ QUICK BOOKING BAR ═══════════════════ */}
      <section className="relative z-10 -mt-20 pb-16">
        <div className="container mx-auto px-6">
          <FadeIn y={20}>
            <div className="bg-white rounded-2xl shadow-2xl shadow-stone-900/10 border border-stone-100 p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 block">Room Type</label>
                    <div className="flex items-center gap-2 border border-stone-200 rounded-xl px-4 h-12 text-sm text-stone-600 bg-stone-50/50">
                      <BedDouble className="h-4 w-4 text-amber-500" />
                      <span>Select a room</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 block">Check-in Date</label>
                    <div className="flex items-center gap-2 border border-stone-200 rounded-xl px-4 h-12 text-sm text-stone-600 bg-stone-50/50">
                      <CalendarDays className="h-4 w-4 text-amber-500" />
                      <span>Select date</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 block">Guests</label>
                    <div className="flex items-center gap-2 border border-stone-200 rounded-xl px-4 h-12 text-sm text-stone-600 bg-stone-50/50">
                      <Users className="h-4 w-4 text-amber-500" />
                      <span>Number of guests</span>
                    </div>
                  </div>
                </div>
                <Link href="/booking" className="w-full md:w-auto">
                  <Button className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold shadow-lg shadow-amber-500/15 h-12 px-8 text-sm tracking-wide uppercase">
                    Check Availability
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ SERVICES ═══════════════════ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <SectionHeading
            eyebrow="What We Offer"
            title="Our Services"
            description="Everything you need for a comfortable and spiritually enriching stay."
          />

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" stagger={0.08}>
            {SERVICES.map((service) => {
              const Icon = ICON_MAP[service.icon] ?? Church;
              return (
                <StaggerItem key={service.title}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={SPRING_SNAPPY}
                    className="group relative p-7 rounded-2xl border border-stone-100 hover:border-amber-200/60 bg-white hover:bg-gradient-to-b hover:from-amber-50/40 hover:to-white transition-colors duration-500 hover:shadow-xl hover:shadow-amber-900/5"
                  >
                    {/* Gold corner accent */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-400/0 group-hover:border-amber-400/40 rounded-tl-2xl transition-all duration-500" />

                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-stone-50 group-hover:bg-amber-50 text-stone-600 group-hover:text-amber-600 mb-5 transition-all duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-[family-name:var(--font-playfair)] font-semibold text-stone-900 mb-2 text-lg">{service.title}</h3>
                    <p className="text-sm text-stone-500 leading-relaxed">{service.description}</p>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════ ROOMS ═══════════════════ */}
      <section className="py-20 md:py-28 bg-stone-50">
        <div className="container mx-auto px-6">
          <SectionHeading
            eyebrow="Accommodation"
            title="Our Rooms & Suites"
            description="From shared rooms perfect for groups to premium executive suites for VIP guests."
          />

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" stagger={0.12}>
            {ROOMS.map((room) => (
              <StaggerItem key={room.slug}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.01 }}
                  transition={SPRING_SNAPPY}
                  className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-stone-900/10 transition-shadow duration-500 ${room.featured ? "ring-1 ring-amber-400/50" : ""}`}
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={IMAGES.rooms[room.slug as keyof typeof IMAGES.rooms]}
                      alt={room.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />

                    {/* Featured badge */}
                    {room.featured && (
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1 bg-amber-500 text-stone-950 text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full shadow-lg">
                          <Star className="h-3 w-3 fill-current" />
                          Premium
                        </span>
                      </div>
                    )}

                    {/* Price overlay */}
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                        <span className="text-xl font-bold text-stone-900">GH₵{room.price}</span>
                        <span className="text-xs text-stone-400 ml-1">/ night</span>
                      </div>
                    </div>

                    {/* Star rating */}
                    <div className="absolute bottom-4 left-4 flex gap-0.5">
                      {Array.from({ length: room.featured ? 5 : 4 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-stone-900 mb-2 group-hover:text-amber-700 transition-colors">
                      {room.name}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-stone-400 mb-4">
                      <span className="flex items-center gap-1.5">
                        <BedDouble className="h-3.5 w-3.5 text-amber-500/60" />
                        {room.beds} Beds
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-amber-500/60" />
                        Up to {room.capacity}
                      </span>
                    </div>

                    <p className="text-sm text-stone-500 leading-relaxed mb-5 line-clamp-2">{room.description}</p>

                    {/* Amenity pills */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {room.amenities.slice(0, 3).map((a) => (
                        <span key={a} className="text-[10px] px-2.5 py-1 rounded-full bg-stone-50 text-stone-500 border border-stone-100 font-medium">
                          {a}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 font-medium">
                          +{room.amenities.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <Link href="/booking">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={SPRING_SNAPPY}>
                        <Button className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium gap-2 h-11 text-sm tracking-wide group/btn">
                          Book This Room
                          <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeIn className="text-center mt-14" delay={0.3}>
            <Link href="/rooms">
              <Button variant="outline" size="lg" className="border-stone-300 text-stone-700 hover:bg-stone-100 hover:border-stone-400 gap-2 h-12 px-8 text-sm tracking-wide uppercase font-medium">
                View All Rooms
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ GROUNDS (real WPTC photos) ═══════════════════ */}
      <section className="py-20 md:py-28 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text side */}
            <SlideIn direction="left" className="order-2 lg:order-1">
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase mb-4 text-amber-600">
                <span className="w-8 h-px bg-current" />
                Our Environment
              </span>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 mb-6 leading-tight">
                A Peaceful Sanctuary
                <br />
                <span className="text-amber-600">in Nature</span>
              </h2>
              <p className="text-stone-500 leading-relaxed mb-6">
                Nestled in the serene outskirts of Kumasi, our retreat centre is surrounded by lush tropical gardens,
                mature fruit trees, and manicured lawns. The peaceful atmosphere provides the perfect environment
                for spiritual renewal, reflection, and rest.
              </p>
              <div className="space-y-3 mb-8">
                {["Lush tropical gardens & mature fruit trees", "Manicured lawns & terracotta walkways", "Peaceful, secure compound", "Natural shade & fresh breeze"].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-stone-600">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 shrink-0">
                      <CheckCircle className="h-3 w-3 text-amber-500" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/gallery">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={SPRING_SNAPPY} className="inline-block">
                  <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-100 hover:border-stone-400 gap-2 text-sm tracking-wide uppercase font-medium">
                    View Gallery
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              </Link>
            </SlideIn>

            {/* Photo grid side */}
            <SlideIn direction="right" className="order-1 lg:order-2" delay={0.2}>
              <div className="relative">
                {/* Main large image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-stone-900/10">
                  <Image
                    src="/images/grounds/grounds-1.jpg"
                    alt="WPTC grounds — walkway through tropical gardens"
                    width={600}
                    height={400}
                    className="w-full h-[300px] md:h-[380px] object-cover"
                  />
                </div>
                {/* Overlapping smaller image */}
                <div className="absolute -bottom-8 -left-4 md:-left-8 w-48 md:w-64 rounded-2xl overflow-hidden shadow-2xl shadow-stone-900/15 border-4 border-white">
                  <Image
                    src="/images/grounds/grounds-2.jpg"
                    alt="WPTC grounds — palm trees and lush lawn"
                    width={260}
                    height={200}
                    className="w-full h-[140px] md:h-[170px] object-cover"
                  />
                </div>
                {/* Gold accent frame */}
                <div className="absolute -top-3 -right-3 w-24 h-24 border-t-2 border-r-2 border-amber-400/40 rounded-tr-2xl" />
                <div className="absolute -bottom-11 right-8 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 px-5 py-2.5 rounded-xl shadow-lg">
                  <p className="text-xs font-bold tracking-wide uppercase">Atwima Boko, Kumasi</p>
                </div>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS (dark section) ═══════════════════ */}
      <section className="relative py-20 md:py-28 text-white overflow-hidden bg-stone-950">
        <Image src={IMAGES.lifestyle.prayer} alt="Worship and prayer" fill className="object-cover opacity-20" sizes="100vw" />
        {/* Gold accent lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="relative container mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase mb-4 text-amber-400">
              <span className="w-8 h-px bg-current" />
              By the Numbers
              <span className="w-8 h-px bg-current" />
            </span>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-white">
              Why Guests Choose Us
            </h2>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-8" stagger={0.15}>
            {[
              { value: 7, label: "Room Types", suffix: "+" },
              { value: 50, label: "Bed Capacity", suffix: "+" },
              { value: 200, label: "Conference Seats", suffix: "+" },
              { value: 3, label: "Event Venues", suffix: "" },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="text-center p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <div className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-b from-amber-300 to-amber-500 bg-clip-text text-transparent">
                    <CountUp target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-xs text-stone-400 font-medium tracking-[0.2em] uppercase">{stat.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════ AMENITIES ═══════════════════ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <SectionHeading
            eyebrow="Facilities"
            title="Amenities & Facilities"
            description="Modern facilities set in a peaceful, lush environment."
          />

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" stagger={0.06}>
            {AMENITIES.map((amenity) => {
              const Icon = ICON_MAP[amenity.icon] ?? Church;
              return (
                <StaggerItem key={amenity.title}>
                  <div className="group flex items-start gap-4 p-5 rounded-2xl border border-transparent hover:border-stone-100 hover:bg-stone-50/50 transition-all duration-300">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-900 mb-1">{amenity.title}</h3>
                      <p className="text-sm text-stone-500 leading-relaxed">{amenity.description}</p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════ HALLS / VENUES ═══════════════════ */}
      <section className="py-20 md:py-28 bg-stone-50">
        <div className="container mx-auto px-6">
          <SectionHeading
            eyebrow="Event Venues"
            title="Conference & Event Halls"
            description="Versatile spaces for worship, conferences, weddings, and special events."
          />

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" stagger={0.15}>
            {HALLS.map((hall, i) => {
              const venueImages = [IMAGES.venues.faithHall, IMAGES.venues.pavilion, IMAGES.venues.diningHall];
              return (
                <StaggerItem key={hall.name}>
                  <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={SPRING_SNAPPY} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-stone-900/10 transition-shadow duration-500">
                    <div className="relative h-52 overflow-hidden">
                      <Image
                        src={venueImages[i] ?? venueImages[0]}
                        alt={hall.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-stone-800 text-xs font-medium px-3 py-1.5 rounded-full">
                          <Users className="h-3 w-3 text-amber-500" />
                          {hall.capacity}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-stone-900 mb-2">{hall.name}</h3>
                      <p className="text-sm text-stone-500 leading-relaxed">{hall.description}</p>
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIAL / TAGLINE ═══════════════════ */}
      <section className="relative py-24 md:py-32 text-white overflow-hidden bg-stone-950">
        <Image src={IMAGES.lifestyle.fellowship} alt="Fellowship at WPTC" fill className="object-cover opacity-15" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/50 via-transparent to-stone-950/50" />

        <div className="relative container mx-auto px-6">
          <FadeIn className="max-w-3xl mx-auto text-center">
            {/* Decorative element */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-amber-500/40" />
              <Sparkles className="h-5 w-5 text-amber-400" />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-amber-500/40" />
            </div>

            <blockquote className="font-[family-name:var(--font-playfair)] text-2xl md:text-4xl font-medium leading-snug mb-8 italic">
              &ldquo;{SITE.tagline}&rdquo;
            </blockquote>

            <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mx-auto mb-6" />

            <p className="text-amber-500/60 text-sm tracking-[0.15em] uppercase font-medium">
              {SITE.name}
            </p>
            <p className="text-stone-500 text-xs mt-1">{SITE.address}</p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="relative py-24 md:py-32 text-white overflow-hidden">
        <Image src={IMAGES.hero.about} alt="Warriors Prayer Tower Complex building" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950/90 via-stone-900/80 to-stone-950/90" />

        <div className="relative container mx-auto px-6 text-center">
          <FadeIn>
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase mb-6 text-amber-400">
              <span className="w-8 h-px bg-current" />
              Begin Your Journey
              <span className="w-8 h-px bg-current" />
            </span>

            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-bold mb-6 max-w-2xl mx-auto leading-tight">
              Plan Your Next
              <br />
              <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                Retreat With Us
              </span>
            </h2>

            <p className="text-stone-300 max-w-lg mx-auto mb-10 text-base leading-relaxed">
              Whether you are planning a church retreat, conference, wedding, or personal getaway, we have the perfect space for you.
            </p>
          </FadeIn>

          <FadeIn delay={0.3} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/booking">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={SPRING_SNAPPY}>
                <Button size="lg" className="gap-2 min-w-[200px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold shadow-2xl shadow-amber-500/20 text-sm h-13 tracking-wide uppercase">
                  Reserve Your Stay
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/contact">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={SPRING_SNAPPY}>
                <Button size="lg" className="min-w-[200px] bg-transparent border border-white/20 text-white hover:bg-white/10 hover:border-white/40 font-medium text-sm h-13 tracking-wide uppercase backdrop-blur-sm">
                  Contact Us
                </Button>
              </motion.div>
            </Link>
          </FadeIn>

          <FadeIn delay={0.5} className="flex flex-wrap items-center justify-center gap-8 text-xs text-stone-400 tracking-wide">
            <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-amber-400 transition-colors">
              <Phone className="h-3.5 w-3.5 text-amber-500/50" />{SITE.phone}
            </a>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
              <MapPin className="h-3.5 w-3.5 text-amber-500/50" />{SITE.address}
            </a>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
