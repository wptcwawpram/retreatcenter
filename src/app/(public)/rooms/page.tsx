import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROOMS, HALLS } from "@/lib/site-data";
import { IMAGES } from "@/lib/images";
import {
  BedDouble,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function RoomsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative text-white py-28 md:py-36 overflow-hidden">
        <Image
          src={IMAGES.hero.rooms}
          alt="Elegant hotel room"
          fill
          className="object-cover"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-amber-950/30" />
        <div className="relative container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 text-amber-200 border-amber-400/30 bg-white/10 px-4 py-1 backdrop-blur-sm">
            Accommodation
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Our{" "}
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Rooms & Suites
            </span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            From affordable shared rooms to premium executive suites &mdash; we have
            the perfect accommodation for every guest and budget.
          </p>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
                      Premium
                    </Badge>
                  </div>
                )}

                {/* Room image */}
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={IMAGES.rooms[room.slug as keyof typeof IMAGES.rooms]}
                    alt={room.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-amber-800 text-sm font-bold px-3 py-1.5 rounded-lg">
                      GH₵{room.price}
                      <span className="text-xs font-normal text-gray-500">/ night</span>
                    </span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-800 transition-colors">
                    {room.name}
                  </h3>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <BedDouble className="h-4 w-4 text-amber-600" />
                      {room.beds} Beds
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-amber-600" />
                      Up to {room.capacity} guests
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed mb-5">
                    {room.description}
                  </p>

                  {/* all amenities */}
                  <div className="space-y-2 mb-6">
                    {room.amenities.map((a) => (
                      <div key={a} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-amber-500 shrink-0" />
                        {a}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <Link href="/booking" className="block">
                      <Button className="w-full bg-amber-800 hover:bg-amber-900 text-white gap-1.5">
                        Book Now
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Halls */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-amber-800 border-amber-300 bg-amber-50 px-4 py-1">
              Event Venues
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Conference & Event Halls
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {HALLS.map((hall, i) => {
              const venueImages = [IMAGES.venues.faithHall, IMAGES.venues.pavilion, IMAGES.venues.diningHall];
              return (
                <Card key={hall.name} className="group border-0 ring-0 shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
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
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{hall.name}</h3>
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
    </>
  );
}
