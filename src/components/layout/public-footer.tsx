import Link from "next/link";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { SITE, NAV_LINKS, SERVICES } from "@/lib/site-data";

export function PublicFooter() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 relative">
      <div className="h-px bg-gradient-to-r from-transparent via-burnt/30 to-transparent" />

      <div className="container mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-burnt flex items-center justify-center">
                <span className="text-white font-bold text-sm tracking-wider">W</span>
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-base font-bold text-white">{SITE.shortName}</h3>
                <p className="text-[8px] text-burnt tracking-[0.18em] uppercase font-semibold">Retreat Centre</p>
              </div>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
              A premier Christian retreat centre in Ghana providing peaceful accommodation,
              conference facilities, and spiritual retreat programs.
            </p>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold text-white mb-5 tracking-wide uppercase">Navigate</h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-neutral-500 hover:text-burnt transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/booking" className="text-sm text-burnt hover:text-burnt-light transition-colors font-medium inline-flex items-center gap-1">
                  Book Now <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold text-white mb-5 tracking-wide uppercase">Services</h3>
            <ul className="space-y-2.5">
              {SERVICES.slice(0, 6).map((service) => (
                <li key={service.title} className="text-sm text-neutral-500 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-burnt/50 shrink-0" />
                  {service.title}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold text-white mb-5 tracking-wide uppercase">Contact</h3>
            <ul className="space-y-4">
              <li>
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-sm text-neutral-500 hover:text-burnt transition-colors">
                  <Phone className="h-3.5 w-3.5 text-burnt/60 shrink-0" />
                  {SITE.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 text-sm text-neutral-500 hover:text-burnt transition-colors">
                  <Mail className="h-3.5 w-3.5 text-burnt/60 shrink-0" />
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-neutral-500">
                <MapPin className="h-3.5 w-3.5 text-burnt/60 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{SITE.fullAddress}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="container mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-neutral-600">{SITE.copyright}</p>
          <p className="text-xs text-neutral-700 italic">Built with care for the Kingdom.</p>
        </div>
      </div>
    </footer>
  );
}
