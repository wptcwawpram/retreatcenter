import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SITE } from "@/lib/site-data";
import {
  Church,
  Heart,
  BookOpen,
  Users,
  Shield,
  Target,
  Eye,
  Sparkles,
} from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Hospitality",
    description:
      "Every guest is treated with warmth, dignity, and genuine Christian love throughout their stay.",
  },
  {
    icon: BookOpen,
    title: "Spiritual Growth",
    description:
      "We provide an atmosphere that nurtures prayer, worship, and deeper connection with God.",
  },
  {
    icon: Shield,
    title: "Excellence",
    description:
      "We maintain high standards in our facilities, services, and guest experience.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We foster fellowship and unity among believers from all denominations and backgrounds.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-amber-950 via-amber-900 to-amber-800 text-white py-20 md:py-28">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 text-amber-200 border-amber-400/30 bg-white/10 px-4 py-1">
            About Us
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              {SITE.shortName}
            </span>
          </h1>
          <p className="text-lg text-amber-100/80 max-w-2xl mx-auto">
            {SITE.subtitle} &mdash; providing a serene haven for spiritual renewal,
            conferences, and family retreats in the heart of Kumasi, Ghana.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-amber-800 border-amber-300 bg-amber-50 px-4 py-1">
                Our Story
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                A Place to Wait on God
              </h2>
            </div>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                Warriors Prayer Tower Complex, also known as Daniels&rsquo; Christian
                Centre, was established to provide a dedicated space where
                believers can retreat from the demands of everyday life and
                draw closer to God in prayer, worship, and fellowship.
              </p>
              <p>
                Located in the serene community of Atwima Boko near Kumasi, Ghana,
                our complex offers a peaceful and secure environment for
                individuals, families, churches, and organisations seeking
                spiritual renewal. Whether you are planning a major conference,
                an intimate bible study retreat, or simply a personal getaway to
                reconnect with your faith, WPTC is your home away from home.
              </p>
              <p>
                Our facilities include comfortable accommodation for groups of
                all sizes, modern conference halls, a fully equipped kitchen and
                dining area, and beautiful outdoor spaces. We are committed to
                making every guest feel welcomed and cared for with genuine
                Christian hospitality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 ring-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-amber-600 to-amber-400" />
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200/50 text-amber-800 mb-5">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Our Mission
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  To provide a serene, well-equipped retreat environment where
                  individuals and groups can experience spiritual upliftment,
                  personal growth, and deeper fellowship with God and one another.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 ring-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-amber-600 to-amber-400" />
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200/50 text-amber-800 mb-5">
                  <Eye className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Our Vision
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  To become the leading Christian retreat centre in West Africa,
                  known for excellence in hospitality, spiritual impact, and
                  creating life-transforming experiences for every guest.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-amber-800 border-amber-300 bg-amber-50 px-4 py-1">
              What Guides Us
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((v) => (
              <div key={v.title} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200/50 text-amber-800 mb-5">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
