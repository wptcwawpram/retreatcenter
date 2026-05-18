import { Badge } from "@/components/ui/badge";
import { AMENITIES } from "@/lib/site-data";
import {
  BedDouble,
  TreePine,
  ChefHat,
  UtensilsCrossed,
  Store,
  Sofa,
  Church,
  Tent,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BedDouble,
  TreePine,
  ChefHat,
  UtensilsCrossed,
  Store,
  Sofa,
  Church,
  Tent,
};

export default function AmenitiesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-amber-950 via-amber-900 to-amber-800 text-white py-20 md:py-28">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 text-amber-200 border-amber-400/30 bg-white/10 px-4 py-1">
            Facilities
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Amenities &{" "}
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Facilities
            </span>
          </h1>
          <p className="text-lg text-amber-100/80 max-w-2xl mx-auto">
            Modern facilities set within a peaceful, lush environment designed
            for your comfort and spiritual renewal.
          </p>
        </div>
      </section>

      {/* Amenities Grid */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {AMENITIES.map((amenity) => {
              const Icon = ICON_MAP[amenity.icon] ?? Church;
              return (
                <div
                  key={amenity.title}
                  className="group flex items-start gap-5 p-6 rounded-2xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-300"
                >
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200/50 flex items-center justify-center text-amber-800 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {amenity.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed">
                      {amenity.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
