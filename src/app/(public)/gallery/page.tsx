import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { IMAGES } from "@/lib/images";
import { Camera } from "lucide-react";

const GALLERY_SECTIONS = [
  {
    title: "Accommodation",
    description: "Our comfortable rooms and suites",
    images: IMAGES.gallery.accommodation,
  },
  {
    title: "Faith Hall & Pavilion",
    description: "Conference and worship venues",
    images: IMAGES.gallery.venues,
  },
  {
    title: "Grounds & Gardens",
    description: "Our serene, lush environment",
    images: IMAGES.gallery.grounds,
  },
  {
    title: "Dining & Kitchen",
    description: "Where meals and fellowship happen",
    images: IMAGES.gallery.dining,
  },
  {
    title: "Events & Retreats",
    description: "Memorable moments at WPTC",
    images: IMAGES.gallery.events,
  },
  {
    title: "The Complex",
    description: "Aerial and exterior views",
    images: IMAGES.gallery.exterior,
  },
];

export default function GalleryPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative text-white py-28 md:py-36 overflow-hidden">
        <Image
          src={IMAGES.hero.gallery}
          alt="WPTC Gallery"
          fill
          className="object-cover"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-amber-950/30" />
        <div className="relative container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 text-amber-200 border-amber-400/30 bg-white/10 px-4 py-1 backdrop-blur-sm">
            <Camera className="h-3.5 w-3.5 mr-1" />
            Gallery
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Photo{" "}
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Gallery
            </span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Take a visual tour of Warriors Prayer Tower Complex and see what
            awaits you.
          </p>
        </div>
      </section>

      {/* Gallery Sections */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-20">
            {GALLERY_SECTIONS.map((section) => (
              <div key={section.title}>
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {section.title}
                  </h2>
                  <p className="text-gray-500">{section.description}</p>
                </div>

                {/* Masonry-style grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {section.images.map((src, i) => (
                    <div
                      key={i}
                      className={`group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ${
                        i === 0 ? "col-span-2 row-span-2 h-[300px] md:h-[400px]" : "h-[200px]"
                      }`}
                    >
                      <Image
                        src={src}
                        alt={`${section.title} - Photo ${i + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes={i === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 50vw, 33vw"}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
