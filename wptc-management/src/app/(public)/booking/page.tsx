import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SITE, ROOMS } from "@/lib/site-data";
import {
  BedDouble,
  Users,
  Phone,
  ArrowRight,
  CalendarCheck,
  Star,
} from "lucide-react";

export default function BookingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-amber-950 via-amber-900 to-amber-800 text-white py-20 md:py-28">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 text-amber-200 border-amber-400/30 bg-white/10 px-4 py-1">
            <CalendarCheck className="h-3.5 w-3.5 mr-1" />
            Book Your Stay
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Reserve Your{" "}
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Room
            </span>
          </h1>
          <p className="text-lg text-amber-100/80 max-w-2xl mx-auto">
            Select from our range of rooms and suites, or contact us directly
            for group bookings and custom retreat packages.
          </p>
        </div>
      </section>

      {/* Booking Info */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              How to Book
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              Online booking is coming soon! For now, please contact us
              directly to reserve your room or plan your retreat.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>
                <Button
                  size="lg"
                  className="bg-amber-800 hover:bg-amber-900 text-white gap-2 min-w-[200px] h-12"
                >
                  <Phone className="h-4 w-4" />
                  Call {SITE.phone}
                </Button>
              </a>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-amber-300 text-amber-800 hover:bg-amber-50 gap-2 min-w-[200px] h-12"
                >
                  Send an Enquiry
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick room price reference */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Room Rates at a Glance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ROOMS.map((room) => (
                <Card
                  key={room.slug}
                  className={`border-0 ring-0 shadow-sm hover:shadow-md transition-shadow ${
                    room.featured ? "ring-1 ring-amber-300" : ""
                  }`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {room.name}
                        </h4>
                        {room.featured && (
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                        <BedDouble className="h-3 w-3" />
                        {room.beds} beds
                        <Users className="h-3 w-3 ml-1" />
                        {room.capacity} guests
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-amber-800">
                        GH₵{room.price}
                      </span>
                      <p className="text-[10px] text-gray-400">per night</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
