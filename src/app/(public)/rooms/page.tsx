import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROOMS, HALLS } from "@/lib/site-data";
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
      <section className="relative bg-gradient-to-br from-amber-950 via-amber-900 to-amber-800 text-white py-20 md:py-28">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 text-amber-200 border-amber-400/30 bg-white/10 px-4 py-1">
            Accommodation
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Our{" "}
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Rooms & Suites
            </span>
          </h1>
          <p className="text-lg text-amber-100/80 max-w-2xl mx-auto">
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

                <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400" />

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

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <span className="text-3xl font-bold text-amber-800">
                        GH₵{room.price}
                      </span>
                      <span className="text-sm text-gray-400 ml-1">/ night</span>
                    </div>
                    <Link href="/booking">
                      <Button className="bg-amber-800 hover:bg-amber-900 text-white gap-1.5">
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
            {HALLS.map((hall) => (
              <Card key={hall.name} className="border-0 ring-0 shadow-md overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-amber-700 to-amber-500" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{hall.name}</h3>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-0">
                      <Users className="h-3 w-3 mr-1" />
                      {hall.capacity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {hall.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
