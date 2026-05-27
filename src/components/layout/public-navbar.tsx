"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone, Mail, MapPin, LogIn, ChevronRight } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site-data";

export function PublicNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";

  return (
    <>
      {/* ── Slim top bar ── */}
      <div className="hidden md:block bg-stone-950 text-stone-300 text-[11px] py-2 border-b border-white/5">
        <div className="container mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <a
              href={`tel:${SITE.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
            >
              <Phone className="h-3 w-3 text-amber-500/70" />
              {SITE.phone}
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
            >
              <Mail className="h-3 w-3 text-amber-500/70" />
              {SITE.email}
            </a>
          </div>
          <div className="flex items-center gap-1.5 text-stone-400">
            <MapPin className="h-3 w-3 text-amber-500/70" />
            {SITE.address}
          </div>
        </div>
      </div>

      {/* ── Main navbar ── */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-500",
          scrolled
            ? "bg-stone-950/95 backdrop-blur-xl shadow-2xl shadow-black/30 border-b border-amber-500/10"
            : isHome
              ? "bg-transparent"
              : "bg-stone-950"
        )}
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-4 group">
            {/* Gold diamond logo mark */}
            <div className="relative">
              <div className="w-11 h-11 rotate-45 rounded-[4px] bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-400/40 transition-shadow" />
              <span className="absolute inset-0 flex items-center justify-center text-stone-950 font-bold text-xs tracking-widest">
                W
              </span>
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-playfair)] text-lg font-bold tracking-wide text-white">
                {SITE.shortName}
              </h1>
              <p className="text-[10px] text-amber-500/60 tracking-[0.2em] uppercase font-medium">
                Retreat Centre
              </p>
            </div>
          </Link>

          {/* ── Desktop nav links ── */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-[13px] font-medium tracking-wide uppercase transition-colors",
                  pathname === link.href
                    ? "text-amber-400"
                    : "text-stone-300 hover:text-white"
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                )}
              </Link>
            ))}
          </nav>

          {/* ── Right side actions ── */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden sm:inline-flex">
              <Button
                variant="ghost"
                size="sm"
                className="text-stone-400 hover:text-white hover:bg-white/5 gap-1.5 text-xs"
              >
                <LogIn className="h-3.5 w-3.5" />
                Staff
              </Button>
            </Link>
            <Link href="/booking" className="hidden sm:inline-flex">
              <Button
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30 transition-all gap-1.5 px-5"
              >
                Book Now
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>

            {/* ── Mobile hamburger ── */}
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-white hover:bg-white/10"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                }
              />
              <SheetContent side="right" className="w-80 bg-stone-950 border-stone-800 p-0">
                {/* Mobile header */}
                <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
                  <div className="relative">
                    <div className="w-9 h-9 rotate-45 rounded-[3px] bg-gradient-to-br from-amber-400 to-amber-600" />
                    <span className="absolute inset-0 flex items-center justify-center text-stone-950 font-bold text-[10px] tracking-widest">
                      W
                    </span>
                  </div>
                  <div>
                    <h2 className="font-[family-name:var(--font-playfair)] text-sm font-bold text-white">
                      {SITE.shortName}
                    </h2>
                    <p className="text-[9px] text-amber-500/60 tracking-[0.2em] uppercase">
                      Retreat Centre
                    </p>
                  </div>
                </div>

                {/* Mobile nav links */}
                <nav className="flex flex-col px-3 py-4 gap-0.5">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "px-4 py-3 text-sm font-medium tracking-wide rounded-lg transition-colors",
                        pathname === link.href
                          ? "text-amber-400 bg-amber-400/5"
                          : "text-stone-300 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="border-t border-white/5 my-3" />

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-stone-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    Staff Login
                  </Link>

                  <div className="px-3 pt-4">
                    <Link href="/booking">
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold shadow-lg">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </nav>

                {/* Mobile contact */}
                <div className="mt-auto px-6 py-6 border-t border-white/5">
                  <a
                    href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 text-xs text-stone-400 hover:text-amber-400 transition-colors mb-2"
                  >
                    <Phone className="h-3 w-3 text-amber-500/50" />
                    {SITE.phone}
                  </a>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="flex items-center gap-2 text-xs text-stone-400 hover:text-amber-400 transition-colors"
                  >
                    <Mail className="h-3 w-3 text-amber-500/50" />
                    {SITE.email}
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
