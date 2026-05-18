import Link from "next/link";
import Image from "next/image";
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

/* ── icon map (avoids dynamic imports) ── */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Heart,
  BedDouble,
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
};

export default function HomePage() {
  return (
    <>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center text-white">
        {/* background image */}
        <Image
          src={IMAGES.hero.home}
          alt="Warriors Prayer Tower Complex"
          fill
          className="object-cover"
          priority
          quality={85}
        />
        {/* dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        {/* amber tint */}
        <div className="absolute inset-0 bg-amber-950/30" />

        <div className="relative container mx-auto px-4 py-24 md:py-36 lg:py-44">
          <div className="max-w-4xl mx-auto text-center">
            {/* pill badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2 rounded-full text-sm font-medium mb-8 text-amber-100">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Daniels&rsquo; Christian Retreat Centre
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              A Serene Environment
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 bg-clip-text text-transparent">
                for Your Spiritual Upliftment
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              {SITE.heroText}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/booking">
                <Button
                  size="lg"
                  className="gap-2 min-w-[200px] bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold shadow-lg shadow-amber-500/25 text-base h-12"
                >
                  Book Your Stay
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/rooms">
                <Button
                  size="lg"
                  className="min-w-[200px] bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-amber-900 font-semibold text-base h-12"
                >
                  Explore Rooms
                </Button>
              </Link>
            </div>

            {/* trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400" />
                Peaceful & Secure
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400" />
                24/7 Backup Power
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400" />
                Free Parking
              </div>
            </div>
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
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-amber-800 border-amber-300 bg-amber-50 px-4 py-1">
              What We Offer
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Everything you need for a comfortable and spiritually enriching stay.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service) => {
              const Icon = ICON_MAP[service.icon] ?? Church;
              return (
                <Card
                  key={service.title}
                  className="group border-0 shadow-none hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-300 ring-0 hover:ring-1 hover:ring-amber-200 bg-gradient-to-b from-white to-amber-50/30"
                >
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200/50 text-amber-800 mb-5 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ ROOMS ═══════════════════ */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-amber-800 border-amber-300 bg-amber-50 px-4 py-1">
              Accommodation
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Rooms
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              From shared rooms perfect for groups to premium executive suites for VIP guests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ROOMS.map((room) => (
              <Card
                key={room.slug}
                className={`group overflow-hidden border-0 ring-0 shadow-md hover:shadow-2xl hover:shadow-amber-900/10 transition-all duration-300 ${
                  room.featured
                    ? "ring-2 ring-amber-400 relative"
                    : "hover:ring-1 hover:ring-amber-200"
                }`}
              >
                {room.featured && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-amber-500 text-white border-0 gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Featured
                    </Badge>
                  </div>
                )}

                {/* Room image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={IMAGES.rooms[room.slug as keyof typeof IMAGES.rooms]}
                    alt={room.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-800 transition-colors">
                        {room.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <BedDouble className="h-3.5 w-3.5" />
                          {room.beds} Beds
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          Up to {room.capacity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed mb-5">
                    {room.description}
                  </p>

                  {/* amenity pills */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {room.amenities.slice(0, 4).map((a) => (
                      <span
                        key={a}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50"
                      >
                        {a}
                      </span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        +{room.amenities.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <span className="text-2xl font-bold text-amber-800">
                        GH₵{room.price}
                      </span>
                      <span className="text-sm text-gray-400 ml-1">
                        / night
                      </span>
                    </div>
                    <Link href="/booking">
                      <Button
                        size="sm"
                        className="bg-amber-800 hover:bg-amber-900 text-white gap-1"
                      >
                        Book
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/rooms">
              <Button
                variant="outline"
                size="lg"
                className="border-amber-300 text-amber-800 hover:bg-amber-50 gap-2"
              >
                View All Rooms & Details
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section className="relative py-16 md:py-20 text-white overflow-hidden">
        <Image
          src={IMAGES.lifestyle.prayer}
          alt="Worship and prayer"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-amber-950/85" />
        <div className="relative container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "7", label: "Room Types", suffix: "+" },
              { value: "50", label: "Bed Capacity", suffix: "+" },
              { value: "200", label: "Conference Seats", suffix: "+" },
              { value: "3", label: "Event Venues" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-b from-amber-200 to-amber-400 bg-clip-text text-transparent">
                  {stat.value}{stat.suffix}
                </div>
                <p className="text-sm text-amber-200/70 font-medium tracking-wide uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ AMENITIES ═══════════════════ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-amber-800 border-amber-300 bg-amber-50 px-4 py-1">
              Facilities
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Amenities & Facilities
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Modern facilities set in a peaceful, lush environment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AMENITIES.map((amenity) => {
              const Icon = ICON_MAP[amenity.icon] ?? Church;
              return (
                <div
                  key={amenity.title}
                  className="group flex items-start gap-4 p-5 rounded-2xl hover:bg-amber-50/50 transition-colors"
                >
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200/50 flex items-center justify-center text-amber-800 group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {amenity.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {amenity.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HALLS / VENUES ═══════════════════ */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-amber-800 border-amber-300 bg-amber-50 px-4 py-1">
              Event Venues
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Conference & Event Halls
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Versatile spaces for worship, conferences, weddings, and special events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HALLS.map((hall, i) => {
              const venueImages = [IMAGES.venues.faithHall, IMAGES.venues.pavilion, IMAGES.venues.diningHall];
              return (
                <Card
                  key={hall.name}
                  className="group border-0 ring-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Venue image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={venueImages[i] ?? venueImages[0]}
                      alt={hall.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <Badge className="absolute bottom-3 left-3 bg-white/90 text-amber-800 border-0 backdrop-blur-sm">
                      <Users className="h-3 w-3 mr-1" />
                      {hall.capacity}
                    </Badge>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {hall.name}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {hall.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIAL / TAGLINE ═══════════════════ */}
      <section className="relative py-20 md:py-28 text-white overflow-hidden">
        <Image
          src={IMAGES.lifestyle.fellowship}
          alt="Fellowship at WPTC"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-amber-950/80" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Quote className="h-12 w-12 text-amber-300 mx-auto mb-6" />
            <blockquote className="text-2xl md:text-3xl font-medium leading-snug mb-6">
              &ldquo;{SITE.tagline}&rdquo;
            </blockquote>
            <p className="text-amber-200/80 text-lg">
              {SITE.name} &mdash; {SITE.address}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="relative py-20 md:py-28 text-white overflow-hidden">
        <Image
          src={IMAGES.hero.about}
          alt="Warriors Prayer Tower Complex building"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/90 via-amber-900/85 to-amber-950/90" />

        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-8">
            <Church className="h-8 w-8 text-amber-300" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 max-w-2xl mx-auto leading-tight">
            Plan Your Next Retreat With Us
          </h2>
          <p className="text-amber-100/80 max-w-lg mx-auto mb-10 text-lg">
            Whether you are planning a church retreat, conference, wedding, or personal getaway, we have the perfect space for you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link href="/booking">
              <Button
                size="lg"
                className="gap-2 min-w-[200px] bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold shadow-lg shadow-amber-500/25 text-base h-12"
              >
                Book Your Stay
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                className="min-w-[200px] bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-amber-900 font-semibold text-base h-12"
              >
                Contact Us
              </Button>
            </Link>
          </div>

          {/* contact quick-links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-amber-200/70">
            <a
              href={`tel:${SITE.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 hover:text-amber-200 transition-colors"
            >
              <Phone className="h-4 w-4" />
              {SITE.phone}
            </a>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-amber-200 transition-colors"
            >
              <MapPin className="h-4 w-4" />
              {SITE.address}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
