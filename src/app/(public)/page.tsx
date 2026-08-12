"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SITE, ROOMS } from "@/lib/site-data";
import { IMAGES } from "@/lib/images";
import {
  ArrowRight,
  BedDouble,
  Users,
  Star,
  Church,
  UtensilsCrossed,
  TreePine,
  Wifi,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Heart,
} from "lucide-react";

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

const HERO_SLIDES = [
  { src: IMAGES.hero.home, title: "A Place of Peace,\nPower & Purpose", subtitle: "Your luxury Christian retreat in the heart of Ghana" },
  { src: IMAGES.amenities.serene, title: "Serene Grounds\n& Gardens", subtitle: "Lush landscapes designed for prayer, meditation and rest" },
  { src: IMAGES.hero.rooms, title: "Premium Rooms\n& Suites", subtitle: "Comfortable accommodation for individuals, families and groups" },
  { src: IMAGES.venues.faithHall, title: "World-Class\nEvent Venues", subtitle: "Conference halls, pavilions and worship spaces for any occasion" },
  { src: IMAGES.gallery.grounds[0], title: "A Sanctuary\nfor Renewal", subtitle: "Come as you are. Leave transformed." },
];

const PILLARS = [
  { icon: Heart, title: "Genuine Hospitality", desc: "Every guest is welcomed with warmth and Christian love." },
  { icon: ShieldCheck, title: "Safe & Secure", desc: "A gated, peaceful compound you can fully relax in." },
  { icon: Sparkles, title: "Spiritual Atmosphere", desc: "An environment charged for prayer and divine encounters." },
];

const FACILITIES = [
  { icon: Church, label: "Conference Halls" },
  { icon: BedDouble, label: "30+ Rooms" },
  { icon: UtensilsCrossed, label: "Dining Hall" },
  { icon: TreePine, label: "Prayer Gardens" },
  { icon: Wifi, label: "Free Wi-Fi" },
  { icon: Star, label: "Premium Suites" },
];

export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback((idx: number) => {
    setDirection(idx > slide ? 1 : -1);
    setSlide(idx);
  }, [slide]);

  const next = useCallback(() => {
    setDirection(1);
    setSlide((s) => (s + 1) % HERO_SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setSlide((s) => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const current = HERO_SLIDES[slide];

  return (
    <>
      {/* ═══ HERO SLIDER ═══ */}
      <section className="relative h-[85vh] min-h-[550px] max-h-[800px] overflow-hidden bg-neutral-900">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={slide}
            custom={direction}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={current.src}
              alt={current.title}
              fill
              className="object-cover"
              priority={slide === 0}
              quality={90}
            />
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
        </AnimatePresence>

        {/* Slide content */}
        <div className="relative h-full container mx-auto px-6 flex items-center">
          <div className="max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] mb-4 whitespace-pre-line">
                  {current.title}
                </h1>
                <p className="text-white/70 text-base md:text-lg mb-8 max-w-md">
                  {current.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center gap-3">
              <Link href="/booking">
                <Button size="lg" className="bg-burnt hover:bg-burnt-dark text-white font-semibold h-12 px-7 text-sm shadow-xl shadow-burnt/25">
                  Book Your Stay
                </Button>
              </Link>
              <Link href="/rooms">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-medium h-12 px-7 text-sm backdrop-blur-sm">
                  View Rooms
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Slider controls */}
        <div className="absolute bottom-6 left-0 right-0">
          <div className="container mx-auto px-6 flex items-center justify-between">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === slide ? "w-8 bg-burnt" : "w-4 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button onClick={prev} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={next} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ THREE PILLARS ═══ */}
      <section className="py-16 bg-white border-b border-neutral-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {PILLARS.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-burnt/8 flex items-center justify-center mx-auto mb-4">
                    <p.icon className="h-5 w-5 text-burnt" />
                  </div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-base font-bold text-neutral-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{p.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ABOUT PREVIEW ═══ */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            <FadeIn>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <Image src={IMAGES.lifestyle.fellowship} alt="Fellowship at WPTC" width={600} height={450} className="w-full h-[380px] object-cover" />
                </div>
                <div className="absolute -bottom-6 -right-4 bg-burnt text-white rounded-xl p-5 shadow-lg hidden md:block">
                  <div className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-0.5">10+</div>
                  <div className="text-xs text-white/70 tracking-wide">Years of<br />Ministry</div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="text-burnt text-xs font-bold tracking-[0.2em] uppercase mb-3">About Us</p>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-neutral-900 mb-5 leading-tight">
                A Sanctuary for Spiritual Renewal
              </h2>
              <p className="text-neutral-500 leading-relaxed mb-4">
                Warriors Prayer Tower Complex is a premier Christian retreat centre nestled in the peaceful community of Atwima Boko, Kumasi, Ghana.
              </p>
              <p className="text-neutral-500 leading-relaxed mb-8">
                Whether you seek a personal retreat, family getaway, church program or a life-transforming encounter — our world-class facilities and genuine hospitality ensure an unforgettable experience.
              </p>
              <Link href="/about">
                <Button variant="outline" className="border-burnt text-burnt hover:bg-burnt hover:text-white gap-2 font-semibold transition-all duration-300">
                  Learn More <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ FACILITIES STRIP ═══ */}
      <section className="py-14 bg-neutral-900 text-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
            {FACILITIES.map((f, i) => (
              <FadeIn key={f.label} delay={i * 0.05}>
                <div className="flex items-center gap-3">
                  <f.icon className="h-5 w-5 text-burnt" />
                  <span className="text-sm font-medium text-white/80">{f.label}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ROOMS SHOWCASE ═══ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14 max-w-xl mx-auto">
            <FadeIn>
              <p className="text-burnt text-xs font-bold tracking-[0.2em] uppercase mb-3">Accommodation</p>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
                Rooms & Suites
              </h2>
              <p className="text-neutral-500">From cozy shared rooms to premium air-conditioned suites — find the perfect space for your stay.</p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {ROOMS.slice(0, 6).map((room, i) => (
              <FadeIn key={room.slug} delay={i * 0.06}>
                <Link href="/booking" className="group block">
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-3">
                    <Image
                      src={IMAGES.rooms[room.slug as keyof typeof IMAGES.rooms]}
                      alt={room.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    {room.featured && (
                      <span className="absolute top-3 left-3 bg-burnt text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md">
                        Premium
                      </span>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        <h3 className="font-[family-name:var(--font-playfair)] text-white font-bold text-base">{room.name}</h3>
                        <div className="flex items-center gap-3 text-white/70 text-[11px] mt-0.5">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{room.capacity}</span>
                          <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{room.beds} beds</span>
                        </div>
                      </div>
                      <span className="text-white font-bold text-sm bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-md">
                        GH₵{room.price}
                      </span>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="text-center mt-10">
            <Link href="/rooms">
              <Button variant="outline" className="border-neutral-300 text-neutral-700 hover:bg-neutral-50 gap-2">
                View All Rooms <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SCRIPTURE BANNER ═══ */}
      <section className="relative py-24 overflow-hidden">
        <Image src={IMAGES.lifestyle.prayer} alt="Prayer" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative container mx-auto px-6 text-center max-w-3xl">
          <FadeIn>
            <blockquote className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl lg:text-3xl text-white italic leading-relaxed mb-5">
              &ldquo;But as for me, I will come into your house in the multitude of your steadfast love; in fear of you I will bow down toward your holy temple.&rdquo;
            </blockquote>
            <p className="text-burnt-light text-sm font-semibold">&mdash; Psalm 5:7</p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: 10, suffix: "+", label: "Years" },
              { value: 30, suffix: "+", label: "Rooms" },
              { value: 5, suffix: "", label: "Venues" },
              { value: 1000, suffix: "+", label: "Guests Served" },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.08} className="text-center">
                <div className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-burnt mb-1">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs text-neutral-400 font-medium tracking-wide uppercase">{stat.label}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-6">
          <FadeIn>
            <div className="max-w-4xl mx-auto bg-burnt rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 text-white shadow-xl shadow-burnt/20">
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold mb-2">Ready to Book Your Stay?</h3>
                <p className="text-white/70 text-sm">Contact us today or book directly online.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <Link href="/booking">
                  <Button size="lg" className="bg-white text-burnt hover:bg-neutral-100 font-semibold h-12 px-7 shadow-md">
                    Book Now <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-7">
                    <Phone className="h-4 w-4 mr-2" /> Call Us
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
