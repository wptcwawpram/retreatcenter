"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import { SITE, NAV_LINKS, SERVICES } from "@/lib/site-data";
import { useSiteLogo } from "@/lib/use-site-logo";

export function PublicFooter() {
  const siteLogo = useSiteLogo();

  return (
    <footer className="bg-luxury relative">
      <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="container mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              {siteLogo ? (
                <Image src={siteLogo} alt={SITE.name} width={200} height={72} className="h-16 w-auto object-contain" unoptimized />
              ) : (
                <>
                  <div className="w-9 h-9 border border-gold/30 rounded flex items-center justify-center">
                    <span className="text-gold font-[family-name:var(--font-playfair)] font-bold text-sm">W</span>
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-playfair)] text-base font-bold text-warm-white">{SITE.shortName}</h3>
                    <p className="text-[8px] text-gold/50 tracking-[0.2em] uppercase">Retreat Centre</p>
                  </div>
                </>
              )}
            </div>
            <p className="text-sm text-warm-muted leading-relaxed max-w-xs">
              A premier Christian retreat centre in Ghana providing peaceful accommodation, conference facilities, and spiritual retreat programs.
            </p>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-semibold text-gold/70 mb-5 tracking-[0.15em] uppercase">Navigate</h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-warm-muted hover:text-gold transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-3">
            <h3 className="text-[11px] font-semibold text-gold/70 mb-5 tracking-[0.15em] uppercase">Services</h3>
            <ul className="space-y-2.5">
              {SERVICES.slice(0, 6).map((service) => (
                <li key={service.title} className="text-sm text-warm-muted flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold/30 shrink-0" />
                  {service.title}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="text-[11px] font-semibold text-gold/70 mb-5 tracking-[0.15em] uppercase">Contact</h3>
            <ul className="space-y-4">
              <li>
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-sm text-warm-muted hover:text-gold transition-colors">
                  <Phone className="h-3.5 w-3.5 text-gold/40 shrink-0" />{SITE.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 text-sm text-warm-muted hover:text-gold transition-colors">
                  <Mail className="h-3.5 w-3.5 text-gold/40 shrink-0" />{SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-warm-muted">
                <MapPin className="h-3.5 w-3.5 text-gold/40 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{SITE.fullAddress}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gold/8">
        <div className="container mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <a href="/admin" className="text-xs text-warm-muted/50 hover:text-warm-muted/70 transition-colors">{SITE.copyright}</a>
        </div>
      </div>
    </footer>
  );
}
