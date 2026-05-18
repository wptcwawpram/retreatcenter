"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SITE, SERVICES, ROOMS, AMENITIES, HALLS } from "@/lib/site-data";
import { IMAGES } from "@/lib/images";
import {
  Church,
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
  Tent,
  Phone,
  MapPin,
  Sparkles,
  CheckCircle,
  Quote,
} from "lucide-react";

/* ── icon map ── */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, Heart, BedDouble, UtensilsCrossed, Shirt, Zap, Car, TreePine, ChefHat, Store, Sofa, Church, Tent,
};

/* ── reusable animation wrappers (inline to avoid import issues during build) ── */
function FadeIn({ children, className, delay = 0, y = 30 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }} transition={{ duration: 0.6, delay, ease: "easeOut" }} className={className}>
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
    <motion.div variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }} className={className}>
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
    let start = 0;
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

function ScaleIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, scale: 0.85 }} animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }} transition={{ duration: 0.5, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

/* ── page ── */
export default function HomePage() {
  return (
    <>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center text-white">
        <Image src={IMAGES.hero.home} alt="Warriors Prayer Tower Complex" fill className="object-cover" priority quality={85} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        <div className="absolute inset-0 bg-amber-950/30" />

        <div className="relative container mx-auto px-4 py-24 md:py-36 lg:py-44">
          <div className="max-w-4xl mx-auto text-center">
            {/* pill badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2 rounded-full text-sm font-medium mb-8 text-amber-100"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              Daniels&rsquo; Christian Retreat Centre
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
            >
              A Serene Environment
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 bg-clip-text text-transparent">
                for Your Spiritual Upliftment
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              {SITE.heroText}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/booking">
                <Button size="lg" className="gap-2 min-w-[200px] bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold shadow-lg shadow-amber-500/25 text-base h-12">
                  Book Your Stay
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/rooms">
                <Button size="lg" className="min-w-[200px] bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-amber-900 font-semibold text-base h-12">
                  Explore Rooms
                </Button>
              </Link>
            </motion.div>

            {/* trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-white/70"
            >
              {["Peaceful & Secure", "24/7 Backup Power", "Free Parking"].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-400" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 80V40C240 0 480 0 720 40C960 80 1200 80 1440 40V80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════ SERVICES ═══════════════════ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-amber-800 border-amber-300 bg-amber-50 px-4 py-1">
              What We Offer
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Everything you need for a comfortable and spiritually enriching stay.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" stagger={0.08}>
            {SERVICES.map((service) => {
              const Icon = ICON_MAP[service.icon] ?? Church;
              return (
                <StaggerItem key={service.title}>
                  <Card className="group border-0 shadow-none hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-300 ring-0 hover:ring-1 hover:ring-amber-200 bg-gradient-to-b from-white to-amber-50/30 h-full">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200/50 text-amber-800 mb-5 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{service.description}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════ ROOMS ═══════════════════ */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="container mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-amber-800 border-amber-300 bg-amber-50 px-4 py-1">Accommodation</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Rooms</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">From shared rooms perfect for groups to premium executive suites for VIP guests.</p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" stagger={0.12}>
            {ROOMS.map((room) => (
              <StaggerItem key={room.slug}>
                <Card className={`group overflow-hidden border-0 ring-0 shadow-md hover:shadow-2xl hover:shadow-amber-900/10 transition-all duration-300 hover:-translate-y-1 ${room.featured ? "ring-2 ring-amber-400 relative" : "hover:ring-1 hover:ring-amber-200"}`}>
                  {room.featured && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-amber-500 text-white border-0 gap-1"><Star className="h-3 w-3 fill-current" />Featured</Badge>
                    </div>
                  )}
                  <div className="relative h-48 overflow-hidden">
                    <Image src={IMAGES.rooms[room.slug as keyof typeof IMAGES.rooms]} alt={room.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-800 transition-colors">{room.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{room.beds} Beds</span>
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />Up to {room.capacity}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-5">{room.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {room.amenities.slice(0, 4).map((a) => (
                        <span key={a} className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50">{a}</span>
                      ))}
                      {room.amenities.length > 4 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">+{room.amenities.length - 4} more</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <span className="text-2xl font-bold text-amber-800">GH₵{room.price}</span>
                        <span className="text-sm text-gray-400 ml-1">/ night</span>
                      </div>
                      <Link href="/booking">
                        <Button size="sm" className="bg-amber-800 hover:bg-amber-900 text-white gap-1">
                          Book<ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeIn className="text-center mt-12" delay={0.3}>
            <Link href="/rooms">
              <Button variant="outline" size="lg" className="border-amber-300 text-amber-800 hover:bg-amber-50 gap-2">
                View All Rooms & Details<ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ STATS (animated counters) ═══════════════════ */}
      <section className="relative py-16 md:py-20 text-white overflow-hidden">
        <Image src={IMAGES.lifestyle.prayer} alt="Worship and prayer" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-amber-950/85" />
        <div className="relative container mx-auto px-4">
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-8" stagger={0.15}>
            {[
              { value: 7, label: "Room Types", suffix: "+" },
              { value: 50, label: "Bed Capacity", suffix: "+" },
              { value: 200, label: "Conference Seats", suffix: "+" },
              { value: 3, label: "Event Venues", suffix: "" },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-b from-amber-200 to-amber-400 bg-clip-text text-transparent">
                    <CountUp target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-sm text-amber-200/70 font-medium tracking-wide uppercase">{stat.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════ AMENITIES ═══════════════════ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-amber-800 border-amber-300 bg-amber-50 px-4 py-1">Facilities</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Amenities & Facilities</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">Modern facilities set in a peaceful, lush environment.</p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" stagger={0.06}>
            {AMENITIES.map((amenity) => {
              const Icon = ICON_MAP[amenity.icon] ?? Church;
              return (
                <StaggerItem key={amenity.title}>
                  <div className="group flex items-start gap-4 p-5 rounded-2xl hover:bg-amber-50/50 transition-colors">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200/50 flex items-center justify-center text-amber-800 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{amenity.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{amenity.description}</p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════ HALLS / VENUES ═══════════════════ */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="container mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-amber-800 border-amber-300 bg-amber-50 px-4 py-1">Event Venues</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Conference & Event Halls</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">Versatile spaces for worship, conferences, weddings, and special events.</p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" stagger={0.15}>
            {HALLS.map((hall, i) => {
              const venueImages = [IMAGES.venues.faithHall, IMAGES.venues.pavilion, IMAGES.venues.diningHall];
              return (
                <StaggerItem key={hall.name}>
                  <Card className="group border-0 ring-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <Image src={venueImages[i] ?? venueImages[0]} alt={hall.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <Badge className="absolute bottom-3 left-3 bg-white/90 text-amber-800 border-0 backdrop-blur-sm">
                        <Users className="h-3 w-3 mr-1" />{hall.capacity}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{hall.name}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{hall.description}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIAL ═══════════════════ */}
      <section className="relative py-20 md:py-28 text-white overflow-hidden">
        <Image src={IMAGES.lifestyle.fellowship} alt="Fellowship at WPTC" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-amber-950/80" />
        <div className="relative container mx-auto px-4">
          <ScaleIn className="max-w-3xl mx-auto text-center">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              <Quote className="h-12 w-12 text-amber-300 mx-auto mb-6" />
            </motion.div>
            <blockquote className="text-2xl md:text-3xl font-medium leading-snug mb-6">
              &ldquo;{SITE.tagline}&rdquo;
            </blockquote>
            <p className="text-amber-200/80 text-lg">{SITE.name} &mdash; {SITE.address}</p>
          </ScaleIn>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="relative py-20 md:py-28 text-white overflow-hidden">
        <Image src={IMAGES.hero.about} alt="Warriors Prayer Tower Complex building" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/90 via-amber-900/85 to-amber-950/90" />

        <div className="relative container mx-auto px-4 text-center">
          <FadeIn>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-8"
            >
              <Church className="h-8 w-8 text-amber-300" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 max-w-2xl mx-auto leading-tight">
              Plan Your Next Retreat With Us
            </h2>
            <p className="text-amber-100/80 max-w-lg mx-auto mb-10 text-lg">
              Whether you are planning a church retreat, conference, wedding, or personal getaway, we have the perfect space for you.
            </p>
          </FadeIn>

          <FadeIn delay={0.3} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link href="/booking">
              <Button size="lg" className="gap-2 min-w-[200px] bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold shadow-lg shadow-amber-500/25 text-base h-12">
                Book Your Stay<ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" className="min-w-[200px] bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-amber-900 font-semibold text-base h-12">
                Contact Us
              </Button>
            </Link>
          </FadeIn>

          <FadeIn delay={0.5} className="flex flex-wrap items-center justify-center gap-6 text-sm text-amber-200/70">
            <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-amber-200 transition-colors">
              <Phone className="h-4 w-4" />{SITE.phone}
            </a>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-amber-200 transition-colors">
              <MapPin className="h-4 w-4" />{SITE.address}
            </a>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
