import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { AMENITIES } from "@/lib/site-data";
import { IMAGES } from "@/lib/images";
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

const AMENITY_IMAGES: Record<string, string> = {
  Accommodation: IMAGES.amenities.accommodation,
  "Serene Environment": IMAGES.amenities.serene,
  Kitchen: IMAGES.amenities.kitchen,
  "Dining Area": IMAGES.amenities.dining,
  Store: IMAGES.amenities.store,
  "Common Room": IMAGES.amenities.commonRoom,
  "Faith Hall": IMAGES.amenities.faithHall,
  Pavilion: IMAGES.amenities.pavilion,
};

export default function AmenitiesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative text-white py-28 md:py-36 overflow-hidden">
        <Image
          src={IMAGES.hero.amenities}
          alt="Resort facilities"
          fill
          className="object-cover"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-amber-950/30" />
        <div className="relative container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 text-amber-200 border-amber-400/30 bg-white/10 px-4 py-1 backdrop-blur-sm">
            Facilities
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Amenities &{" "}
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Facilities
            </span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Modern facilities set within a peaceful, lush environment designed
            for your comfort and spiritual renewal.
          </p>
        </div>
      </section>

      {/* Amenities Grid — cards with images */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {AMENITIES.map((amenity) => {
              const Icon = ICON_MAP[amenity.icon] ?? Church;
              const imgSrc = AMENITY_IMAGES[amenity.title];
              return (
                <div
                  key={amenity.title}
                  className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300"
                >
                  {/* Image */}
                  {imgSrc && (
                    <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 overflow-hidden">
                      <Image
                        src={imgSrc}
                        alt={amenity.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, 200px"
                      />
                    </div>
                  )}
                  {/* Content */}
                  <div className="flex items-start gap-4 p-6">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200/50 flex items-center justify-center text-amber-800 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {amenity.title}
                      </h3>
                      <p className="text-gray-500 leading-relaxed text-sm">
                        {amenity.description}
                      </p>
                    </div>
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
