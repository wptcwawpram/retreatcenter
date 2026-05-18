import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/lib/site-data";
import { IMAGES } from "@/lib/images";
import {
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Church,
  Phone,
} from "lucide-react";

const PACKAGES = [
  {
    name: "Day Retreat",
    subtitle: "For groups and churches",
    price: "Contact us",
    duration: "1 day",
    capacity: "10 - 200+",
    image: IMAGES.venues.faithHall,
    includes: [
      "Use of Faith Hall or Pavilion",
      "PA system and projector",
      "Seating arrangement",
      "Parking for all guests",
      "Cafeteria access (meals at extra cost)",
    ],
    featured: false,
  },
  {
    name: "Weekend Retreat",
    subtitle: "Most popular for church groups",
    price: "Contact us",
    duration: "2 - 3 days",
    capacity: "10 - 100+",
    image: IMAGES.lifestyle.prayer,
    includes: [
      "Accommodation (room of choice)",
      "Use of conference hall",
      "PA system and projector",
      "Breakfast, lunch & dinner",
      "Chaplaincy support available",
      "Parking for all guests",
      "Room service",
    ],
    featured: true,
  },
  {
    name: "Extended Retreat",
    subtitle: "For deeper spiritual engagement",
    price: "Contact us",
    duration: "4 - 7 days",
    capacity: "5 - 50+",
    image: IMAGES.lifestyle.fellowship,
    includes: [
      "Accommodation (room of choice)",
      "Full board meals",
      "Exclusive hall booking",
      "PA system and projector",
      "Chaplaincy & counselling",
      "Laundry service",
      "Parking for all guests",
      "Room service",
    ],
    featured: false,
  },
  {
    name: "Family Getaway",
    subtitle: "Perfect for family bonding",
    price: "Contact us",
    duration: "2 - 5 days",
    capacity: "2 - 10",
    image: IMAGES.lifestyle.family,
    includes: [
      "Executive Suite or Holy Family Apartment",
      "Full board meals",
      "Private kitchen access",
      "Serene garden access",
      "Parking",
      "Room service",
    ],
    featured: false,
  },
];

export default function PackagesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative text-white py-28 md:py-36 overflow-hidden">
        <Image
          src={IMAGES.hero.packages}
          alt="WPTC Retreat Packages"
          fill
          className="object-cover"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-amber-950/30" />
        <div className="relative container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 text-amber-200 border-amber-400/30 bg-white/10 px-4 py-1 backdrop-blur-sm">
            Packages
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Retreat{" "}
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Packages
            </span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Customized packages for churches, organisations, families, and
            individuals. We tailor every retreat to your needs.
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {PACKAGES.map((pkg) => (
              <Card
                key={pkg.name}
                className={`group overflow-hidden border-0 ring-0 shadow-md hover:shadow-2xl transition-all duration-300 ${
                  pkg.featured
                    ? "ring-2 ring-amber-400 relative"
                    : "hover:ring-1 hover:ring-amber-200"
                }`}
              >
                {pkg.featured && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-amber-500 text-white border-0 gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Package image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={pkg.image}
                    alt={pkg.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                    <p className="text-sm text-amber-200">{pkg.subtitle}</p>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-5 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Church className="h-4 w-4 text-amber-600" />
                      {pkg.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-amber-600" />
                      {pkg.capacity}
                    </span>
                  </div>

                  <div className="space-y-2.5 mb-6">
                    {pkg.includes.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-lg font-bold text-amber-800">
                      {pkg.price}
                    </span>
                    <Link href="/contact">
                      <Button className="bg-amber-800 hover:bg-amber-900 text-white gap-1.5">
                        Enquire
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Custom package CTA */}
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <Card className="border-0 ring-0 shadow-lg overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={IMAGES.lifestyle.wedding}
                  alt="Special events at WPTC"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 672px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-950/90 via-amber-950/50 to-amber-950/20" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Need a Custom Package?
                  </h3>
                  <p className="text-amber-100/80 text-sm">
                    We can create a tailored retreat package to match your
                    group size, budget, and specific requirements.
                  </p>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/contact">
                    <Button className="bg-amber-800 hover:bg-amber-900 text-white gap-1.5">
                      Contact Us
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>
                    <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-50 gap-1.5">
                      <Phone className="h-4 w-4" />
                      {SITE.phone}
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
