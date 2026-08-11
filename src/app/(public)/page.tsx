"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect, type ReactNode } from "react";
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
  CalendarDays,
  Search,
  CreditCard,
  UserCheck,
  ClipboardCheck,
  Home,
  Sparkles,
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
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: SPRING } }} className={className}>
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

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-4">
      <span className="h-px w-8 bg-gold/40" />
      <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-gold">{label}</span>
      <span className="h-px w-8 bg-gold/40" />
    </div>
  );
}

const GALLERY_IMAGES = [
  { src: IMAGES.amenities.serene, label: "Serene Grounds" },
  { src: IMAGES.gallery.grounds[1], label: "Lush Gardens" },
  { src: IMAGES.lifestyle.prayer, label: "Prayer & Worship" },
  { src: IMAGES.hero.rooms, label: "Premium Rooms" },
];

const FACILITIES = [
  { icon: Church, label: "Auditorium &\nConference Halls" },
  { icon: Sparkles, label: "Chapel" },
  { icon: BedDouble, label: "Accommodation" },
  { icon: UtensilsCrossed, label: "Dining &\nRestaurant" },
  { icon: TreePine, label: "Prayer Gardens" },
  { icon: Wifi, label: "Free Wi-Fi" },
];

const BOOKING_STEPS = [
  { num: 1, icon: CalendarDays, title: "Select Dates", desc: "Choose your check-in and check-out dates." },
  { num: 2, icon: Search, title: "Choose Room", desc: "View available rooms that fit your stay." },
  { num: 3, icon: Home, title: "Add Extras", desc: "Select any additional services you need." },
  { num: 4, icon: UserCheck, title: "Guest Details", desc: "Enter your information to continue." },
  { num: 5, icon: CreditCard, title: "Review & Pay", desc: "Review your booking and make payment." },
  { num: 6, icon: ClipboardCheck, title: "Confirmation", desc: "Receive your booking confirmation instantly." },
];

const STATS = [
  { value: 10, suffix: "+", label: "Years" },
  { value: 30, suffix: "+", label: "Rooms" },
  { value: 5, suffix: "", label: "Venues" },
  { value: 1000, suffix: "+", label: "Guests" },
];

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImageY = useTransform(heroProgress, [0, 1], [0, 150]);
  const heroImageScale = useTransform(heroProgress, [0, 1], [1.05, 1.2]);
  const heroContentY = useTransform(heroProgress, [0, 1], [0, 60]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[100vh] flex items-center text-white">
        <motion.div className="absolute inset-0" style={{ y: heroImageY, scale: heroImageScale }}>
          <Image src={IMAGES.hero.home} alt="Warriors Prayer Tower Complex" fill className="object-cover" priority quality={90} />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/65 to-charcoal/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-charcoal/20" />

        <motion.div className="relative container mx-auto px-6 py-24 md:py-32 lg:py-40" style={{ y: heroContentY, opacity: heroOpacity }}>
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...SPRING, delay: 0.3 }}
              className="flex items-center gap-3 mb-6">
              <span className="h-px w-10 bg-gold/60" />
              <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold">A Place of</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.5 }}
              className="font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.92] mb-8">
              Peace, Power
              <br />
              <span className="bg-gradient-to-r from-gold via-gold to-gold-dark bg-clip-text text-transparent">&amp; Purpose</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.7 }}
              className="text-[15px] text-white/60 max-w-md mb-10 leading-relaxed">
              A luxury Christian retreat centre for restoration, prayer and divine encounters in the heart of Ghana.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.9 }}
              className="flex flex-col sm:flex-row items-start gap-3">
              <Link href="/booking">
                <Button size="lg" className="bg-gold hover:bg-gold-dark text-charcoal font-semibold h-13 px-8 text-sm tracking-wide shadow-lg shadow-gold/20">
                  Book Your Stay
                </Button>
              </Link>
              <Link href="/rooms">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-medium h-13 px-8 text-sm tracking-wide">
                  Explore Our Spaces
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ivory to-transparent" />
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="relative z-10 -mt-12 pb-8">
        <div className="container mx-auto px-6">
          <FadeIn>
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl shadow-black/5 border border-neutral-100 p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {STATS.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-charcoal mb-1">
                      <CountUp target={stat.value} suffix={stat.suffix} />
                    </div>
                    <p className="text-[11px] text-neutral-400 font-medium tracking-[0.15em] uppercase">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ ABOUT TEASER ═══ */}
      <section className="py-24 md:py-32 bg-ivory">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center max-w-6xl mx-auto">
            <FadeIn>
              <SectionLabel label="Welcome" />
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-[40px] font-bold text-charcoal mb-6 leading-tight">
                Experience Heaven<br />on Earth
              </h2>
              <p className="text-neutral-500 leading-relaxed mb-6">
                Whether you are here for a personal retreat, family getaway, church program or a life-transforming encounter, you are in the right place.
              </p>
              <p className="text-neutral-500 leading-relaxed mb-8">
                Set within the peaceful community of Atwima Boko near Kumasi, Ghana, Warriors Prayer Tower Complex offers world-class facilities designed for your comfort and spiritual renewal.
              </p>
              <Link href="/about">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal hover:text-gold transition-colors group">
                  Discover Our Story
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="grid grid-cols-2 gap-3">
                {GALLERY_IMAGES.map((img) => (
                  <div key={img.label} className="group relative rounded-xl overflow-hidden aspect-[4/3]">
                    <Image src={img.src} alt={img.label} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 50vw, 25vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent" />
                    <p className="absolute bottom-3 left-3 text-white text-[11px] font-medium tracking-wide">{img.label}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ BIBLE VERSE ═══ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <Image src={IMAGES.lifestyle.prayer} alt="Prayer" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-charcoal/75" />
        <div className="relative container mx-auto px-6">
          <FadeIn className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <span className="h-px w-16 bg-gold/40" />
            </div>
            <blockquote className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl lg:text-3xl text-white italic leading-relaxed mb-6">
              &ldquo;But as for me, I will come into your house in the multitude of your steadfast love; in fear of you I will bow down toward your holy temple.&rdquo;
            </blockquote>
            <p className="text-sm text-gold font-medium">&mdash; Psalm 5:7</p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ OUR FACILITIES ═══ */}
      <section className="py-24 md:py-32 bg-ivory">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <SectionLabel label="Facilities" />
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-[40px] font-bold text-charcoal mb-4">
              World-Class Amenities
            </h2>
            <p className="text-neutral-500 max-w-lg mx-auto">
              Thoughtfully designed spaces for your comfort, worship, and renewal.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 max-w-4xl mx-auto" stagger={0.08}>
            {FACILITIES.map((f) => (
              <StaggerItem key={f.label}>
                <div className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-neutral-100 flex items-center justify-center mb-3 group-hover:shadow-md group-hover:border-gold/30 transition-all duration-300">
                    <f.icon className="h-6 w-6 text-charcoal group-hover:text-gold transition-colors" />
                  </div>
                  <p className="text-xs font-medium text-neutral-600 whitespace-pre-line leading-tight">{f.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ ROOMS PREVIEW ═══ */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <SectionLabel label="Accommodation" />
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-[40px] font-bold text-charcoal mb-4">
              Rooms &amp; Suites
            </h2>
            <p className="text-neutral-500">Comfort that feels like home.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {ROOMS.slice(0, 4).map((room, i) => (
              <FadeIn key={room.slug} delay={i * 0.08}>
                <div className="group bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={IMAGES.rooms[room.slug as keyof typeof IMAGES.rooms]}
                      alt={room.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {room.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 bg-gold text-charcoal text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">
                          <Star className="h-3 w-3 fill-current" />Premium
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-white/90 backdrop-blur-sm text-charcoal text-sm font-bold px-3 py-1.5 rounded-lg">
                        GH₵ {room.price}<span className="text-neutral-400 text-xs font-normal"> /night</span>
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-charcoal mb-2">{room.name}</h3>
                    <div className="flex items-center gap-4 text-xs text-neutral-400 mb-3">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{room.capacity} Guests</span>
                      <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{room.beds} Beds</span>
                    </div>
                    <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2 mb-4">{room.description}</p>
                    <Link href="/booking">
                      <Button size="sm" className="w-full bg-charcoal hover:bg-charcoal-light text-white text-xs h-9 tracking-wide">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="text-center mt-12">
            <Link href="/rooms">
              <Button variant="outline" className="border-neutral-300 text-charcoal hover:bg-neutral-50 gap-2 tracking-wide">
                View All Rooms <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ═══ EASY BOOKING EXPERIENCE ═══ */}
      <section className="py-20 md:py-28 bg-charcoal text-white">
        <div className="container mx-auto px-6">
          <FadeIn className="mb-14 text-center">
            <SectionLabel label="Reservations" />
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold mb-3">Easy Booking Experience</h2>
            <p className="text-neutral-500 text-sm">Simple. Fast. Secure.</p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 max-w-5xl mx-auto" stagger={0.08}>
            {BOOKING_STEPS.map((step) => (
              <StaggerItem key={step.num}>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-lg font-bold text-gold">{step.num}</span>
                  </div>
                  <h4 className="text-sm font-semibold mb-1 text-white">{step.title}</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">{step.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ NEED HELP BOOKING? ═══ */}
      <section className="py-16 bg-ivory">
        <div className="container mx-auto px-6">
          <FadeIn>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-charcoal mb-1">Need Help Booking?</h3>
                <p className="text-sm text-neutral-500">Call us directly or send us an email.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm font-medium text-charcoal hover:text-gold transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center"><Phone className="h-4 w-4 text-gold" /></div>
                  {SITE.phone}
                </a>
                <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 text-sm font-medium text-charcoal hover:text-gold transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center"><Mail className="h-4 w-4 text-gold" /></div>
                  {SITE.email}
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
