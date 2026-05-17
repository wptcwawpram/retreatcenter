import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/lib/site-data";
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
      <section className="relative bg-gradient-to-br from-amber-950 via-amber-900 to-amber-800 text-white py-20 md:py-28">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 text-amber-200 border-amber-400/30 bg-white/10 px-4 py-1">
            Packages
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Retreat{" "}
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Packages
            </span>
          </h1>
          <p className="text-lg text-amber-100/80 max-w-2xl mx-auto">
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

                <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400" />

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-amber-700 font-medium mb-4">
                    {pkg.subtitle}
                  </p>

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
            <Card className="border-0 ring-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100/30">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Need a Custom Package?
                </h3>
                <p className="text-gray-500 mb-6">
                  We can create a tailored retreat package to match your
                  group size, budget, and specific requirements. Contact us
                  to discuss your needs.
                </p>
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
