import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, ImageIcon } from "lucide-react";

/* Placeholder gallery items — will be replaced with real images from CMS / uploads */
const GALLERY_SECTIONS = [
  {
    title: "Accommodation",
    description: "Our comfortable rooms and suites",
    count: 6,
  },
  {
    title: "Faith Hall & Pavilion",
    description: "Conference and worship venues",
    count: 4,
  },
  {
    title: "Grounds & Gardens",
    description: "Our serene, lush environment",
    count: 5,
  },
  {
    title: "Dining & Kitchen",
    description: "Where meals and fellowship happen",
    count: 3,
  },
  {
    title: "Events & Retreats",
    description: "Memorable moments at WPTC",
    count: 4,
  },
  {
    title: "The Complex",
    description: "Aerial and exterior views",
    count: 3,
  },
];

export default function GalleryPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-amber-950 via-amber-900 to-amber-800 text-white py-20 md:py-28">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 text-amber-200 border-amber-400/30 bg-white/10 px-4 py-1">
            <Camera className="h-3.5 w-3.5 mr-1" />
            Gallery
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Photo{" "}
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Gallery
            </span>
          </h1>
          <p className="text-lg text-amber-100/80 max-w-2xl mx-auto">
            Take a visual tour of Warriors Prayer Tower Complex and see what
            awaits you.
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Photos coming soon. We are currently updating our gallery with
              the latest images of our facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {GALLERY_SECTIONS.map((section) => (
              <Card
                key={section.title}
                className="group border-0 ring-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* placeholder image area */}
                <div className="aspect-[4/3] bg-gradient-to-br from-amber-100 to-amber-200/30 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-10 w-10 text-amber-400 mx-auto mb-2" />
                    <p className="text-xs text-amber-600 font-medium">
                      {section.count} photos
                    </p>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {section.description}
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
