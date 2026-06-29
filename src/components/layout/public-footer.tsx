import Link from "next/link";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { SITE, NAV_LINKS, SERVICES } from "@/lib/site-data";

export function PublicFooter() {
  return (
    <footer className="bg-green-950 text-stone-400 relative overflow-hidden">
      {/* Decorative gold line */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-600/40 to-transparent" />

      {/* Main footer */}
      <div className="container mx-auto px-6 pt-20 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="w-10 h-10 rotate-45 rounded-[3px] bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700" />
                <span className="absolute inset-0 flex items-center justify-center text-green-950 font-bold text-xs tracking-widest">
                  W
                </span>
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-white">
                  {SITE.shortName}
                </h3>
                <p className="text-[9px] text-amber-600/50 tracking-[0.2em] uppercase">
                  Retreat Centre
                </p>
              </div>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed mb-8 max-w-xs">
              A premier Christian retreat centre in Ghana providing peaceful accommodation,
              conference facilities, and spiritual retreat programs.
            </p>
            {/* Gold separator */}
            <div className="w-12 h-px bg-gradient-to-r from-amber-600/60 to-transparent" />
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="font-[family-name:var(--font-playfair)] text-sm font-semibold text-white mb-6 tracking-wide">
              Navigation
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-500 hover:text-amber-500 transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-300">
                      <ArrowUpRight className="h-3 w-3 text-amber-600" />
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/booking"
                  className="text-sm text-amber-600 hover:text-amber-500 transition-colors font-medium"
                >
                  Book Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-3">
            <h3 className="font-[family-name:var(--font-playfair)] text-sm font-semibold text-white mb-6 tracking-wide">
              Services
            </h3>
            <ul className="space-y-3">
              {SERVICES.slice(0, 6).map((service) => (
                <li
                  key={service.title}
                  className="text-sm text-stone-500 flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-amber-600/40 shrink-0" />
                  {service.title}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="font-[family-name:var(--font-playfair)] text-sm font-semibold text-white mb-6 tracking-wide">
              Get in Touch
            </h3>
            <ul className="space-y-5">
              <li>
                <a
                  href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 text-sm text-stone-500 hover:text-amber-500 transition-colors group"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] group-hover:border-amber-600/20 group-hover:bg-amber-600/5 transition-all">
                    <Phone className="h-3.5 w-3.5 text-amber-600/60" />
                  </div>
                  {SITE.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-3 text-sm text-stone-500 hover:text-amber-500 transition-colors group"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] group-hover:border-amber-600/20 group-hover:bg-amber-600/5 transition-all">
                    <Mail className="h-3.5 w-3.5 text-amber-600/60" />
                  </div>
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-stone-500">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-amber-600/60" />
                </div>
                <span className="leading-relaxed">{SITE.fullAddress}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-600">
            {SITE.copyright}
          </p>
          <p className="text-xs text-stone-700 italic">
            Built with care for the Kingdom.
          </p>
        </div>
      </div>
    </footer>
  );
}
