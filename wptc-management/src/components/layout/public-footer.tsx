import Link from "next/link";
import { Church, Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { SITE, NAV_LINKS, SERVICES } from "@/lib/site-data";

export function PublicFooter() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* main footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 text-amber-50">
                <Church className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {SITE.shortName}
                </h3>
                <p className="text-[10px] text-gray-500">
                  {SITE.subtitle}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              A premier Christian retreat centre in Ghana providing peaceful
              accommodation, conference facilities, and spiritual retreat
              programs for individuals and groups.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-5 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/booking"
                  className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium inline-flex items-center gap-1"
                >
                  Book Now
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-5 uppercase tracking-wider">
              Our Services
            </h3>
            <ul className="space-y-3">
              {SERVICES.slice(0, 6).map((service) => (
                <li
                  key={service.title}
                  className="text-sm text-gray-400"
                >
                  {service.title}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-5 uppercase tracking-wider">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-amber-400 transition-colors group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 group-hover:bg-amber-900/50 transition-colors">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  {SITE.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-amber-400 transition-colors group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 group-hover:bg-amber-900/50 transition-colors">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span className="leading-relaxed">{SITE.fullAddress}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            {SITE.copyright}
          </p>
          <p className="text-xs text-gray-600">
            Built with care for the Kingdom.
          </p>
        </div>
      </div>
    </footer>
  );
}
