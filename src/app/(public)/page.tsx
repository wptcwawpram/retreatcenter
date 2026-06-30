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
  Tent,
  UtensilsCrossed,
  TreePine,
  Wifi,
  Phone,
  Mail,
  CalendarDays,
  Home,
  Search,
  CreditCard,
  UserCheck,
  ClipboardCheck,
  CheckCircle,
  Sparkles,
} from "lucide-react";

const SPRING = { type: "spring" as const, stiffness: 80, damping: 20, mass: 0.8 };
const SPRING_SNAPPY = { type: "spring" as const, stiffness: 200, damping: 25, mass: 0.5 };

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

const FEATURE_BADGES = [
  { icon: BedDouble, label: "Comfortable Accommodation" },
  { icon: Church, label: "Holy Spirit Atmosphere" },
  { icon: Star, label: "Premium Facilities" },
  { icon: Users, label: "Excellent Hospitality" },
];

const GALLERY_IMAGES = [
  { src: IMAGES.amenities.serene, label: "Serene Environment" },
  { src: IMAGES.gallery.grounds[1], label: "Beautiful Landscape" },
  { src: IMAGES.lifestyle.prayer, label: "Prayer & Worship" },
  { src: IMAGES.hero.rooms, label: "Rest & Relaxation" },
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
        <div className="absolute inset-0 bg-gradient-to-r from-green-950/85 via-green-950/60 to-green-950/40" />

        <motion.div className="relative container mx-auto px-6 py-24 md:py-32 lg:py-40" style={{ y: heroContentY, opacity: heroOpacity }}>
          <div className="max-w-2xl">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.3 }}
              className="text-sm md:text-base font-medium tracking-wide text-white/80 mb-4">
              A Place of
            </motion.p>

            <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.5 }}
              className="font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-6">
              PEACE, POWER
              <br />
              <span className="text-amber-500">&amp; PURPOSE</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.7 }}
              className="text-sm md:text-base text-white/70 max-w-md mb-8 leading-relaxed">
              A Luxury Christian Retreat Center for Restoration, Prayer and Divine Encounters.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.9 }}
              className="flex flex-col sm:flex-row items-start gap-3">
              <Link href="/booking">
                <Button size="lg" className="bg-green-800 hover:bg-green-700 text-white font-medium h-12 px-8 text-sm">
                  Book Your Stay
                </Button>
              </Link>
              <Link href="/rooms">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-medium h-12 px-8 text-sm">
                  Explore Our Spaces
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#faf8f5] to-transparent" />
      </section>

      {/* ═══ FEATURE BADGES ═══ */}
      <section className="relative z-10 -mt-10 pb-8">
        <div className="container mx-auto px-6">
          <FadeIn>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {FEATURE_BADGES.map((badge) => (
                <div key={badge.label} className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-md border border-stone-100">
                  <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <badge.icon className="h-4 w-4 text-green-700" />
                  </div>
                  <span className="text-sm font-medium text-stone-700">{badge.label}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ EXPERIENCE HEAVEN ON EARTH ═══ */}
      <section className="py-20 md:py-28 bg-[#faf8f5]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <FadeIn>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-stone-900 mb-5 leading-tight">
                Experience Heaven on Earth
              </h2>
              <p className="text-stone-500 leading-relaxed">
                Whether you are here for a personal retreat, family getaway, church program or a life transforming encounter, you are in the right place.
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="grid grid-cols-2 gap-3">
                {GALLERY_IMAGES.map((img) => (
                  <div key={img.label} className="group relative rounded-xl overflow-hidden aspect-[4/3]">
                    <Image src={img.src} alt={img.label} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <p className="absolute bottom-3 left-3 text-white text-xs font-semibold italic">{img.label}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ BIBLE VERSE ═══ */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-6">
          <FadeIn className="max-w-3xl mx-auto text-center">
            <blockquote className="font-[family-name:var(--font-playfair)] text-lg md:text-xl text-stone-600 italic leading-relaxed mb-4">
              &ldquo;But as for me, I will come into your house in the multitude of your steadfast love; in fear of you I will bow down toward your holy temple.&rdquo;
            </blockquote>
            <p className="text-sm text-stone-400 font-medium">&mdash; Psalm 5:7</p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ OUR FACILITIES ═══ */}
      <section className="py-20 md:py-28 bg-[#faf8f5]">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-stone-900 mb-3">
              Our Facilities
            </h2>
            <p className="text-stone-500 max-w-lg mx-auto">
              World class facilities designed to make your stay comfortable and your experience unforgettable.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl mx-auto" stagger={0.08}>
            {FACILITIES.map((f) => (
              <StaggerItem key={f.label}>
                <div className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-stone-100 flex items-center justify-center mb-3 group-hover:shadow-md group-hover:border-green-200 transition-all">
                    <f.icon className="h-6 w-6 text-green-700" />
                  </div>
                  <p className="text-xs font-medium text-stone-600 whitespace-pre-line leading-tight">{f.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ ROOMS PREVIEW ═══ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-stone-900 mb-3">
              Rooms &amp; Suites
            </h2>
            <p className="text-stone-500">Comfort that feels like home.</p>
          </FadeIn>

          <div className="space-y-6 max-w-4xl mx-auto">
            {ROOMS.slice(0, 4).map((room, i) => (
              <FadeIn key={room.slug} delay={i * 0.08}>
                <div className="group flex flex-col md:flex-row bg-white rounded-xl border border-stone-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative md:w-[280px] h-52 md:h-auto shrink-0 overflow-hidden">
                    <Image
                      src={IMAGES.rooms[room.slug as keyof typeof IMAGES.rooms]}
                      alt={room.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 280px"
                    />
                  </div>
                  <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-stone-900 mb-2">{room.name}</h3>
                      <div className="flex items-center gap-4 text-xs text-stone-400 mb-3">
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{room.capacity} Guests</span>
                        <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{room.beds} Beds</span>
                      </div>
                      <p className="text-sm text-stone-500 leading-relaxed line-clamp-2">{room.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
                      <div>
                        <span className="text-xl font-bold text-stone-900">GH₵ {room.price}</span>
                        <span className="text-xs text-stone-400 ml-1">/ night</span>
                      </div>
                      <Link href="/booking">
                        <Button size="sm" className="bg-green-800 hover:bg-green-700 text-white text-xs h-9 px-5">
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="text-center mt-10">
            <Link href="/rooms">
              <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50 gap-2">
                View All Rooms <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ═══ EASY BOOKING EXPERIENCE ═══ */}
      <section className="py-16 md:py-20 bg-green-950 text-white">
        <div className="container mx-auto px-6">
          <FadeIn className="mb-12">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold mb-2">Easy Booking Experience</h2>
            <p className="text-green-200/60 text-sm">Simple. Fast. Secure.</p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6" stagger={0.08}>
            {BOOKING_STEPS.map((step) => (
              <StaggerItem key={step.num}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-green-800 border-2 border-green-600 flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-amber-500">{step.num}</span>
                  </div>
                  <h4 className="text-sm font-semibold mb-1">{step.title}</h4>
                  <p className="text-xs text-green-200/50 leading-relaxed">{step.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ NEED HELP BOOKING? ═══ */}
      <section className="py-14 bg-[#faf8f5]">
        <div className="container mx-auto px-6">
          <FadeIn>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-stone-900 mb-1">Need Help Booking?</h3>
                <p className="text-sm text-stone-500">Call us directly or send us an email.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm font-medium text-green-800 hover:text-green-700 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center"><Phone className="h-4 w-4 text-green-700" /></div>
                  {SITE.phone}
                </a>
                <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 text-sm font-medium text-green-800 hover:text-green-700 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center"><Mail className="h-4 w-4 text-green-700" /></div>
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
