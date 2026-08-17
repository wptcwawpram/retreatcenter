"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Menu, Phone, Mail } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site-data";
import { useSiteLogo } from "@/lib/use-site-logo";
import Image from "next/image";

export function PublicNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const siteLogo = useSiteLogo();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-500",
          scrolled
            ? "bg-luxury/95 backdrop-blur-md border-b border-gold/10"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto flex h-[72px] items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {siteLogo ? (
              <Image src={siteLogo} alt={SITE.name} width={200} height={64} className="h-14 w-auto object-contain" unoptimized />
            ) : (
              <>
                <div className="w-9 h-9 border border-gold/40 rounded flex items-center justify-center">
                  <span className="text-gold font-[family-name:var(--font-playfair)] font-bold text-sm">W</span>
                </div>
                <div>
                  <h1 className="font-[family-name:var(--font-playfair)] text-[15px] font-bold tracking-[0.08em] text-warm-white leading-tight">
                    WARRIORS
                  </h1>
                  <p className="text-[8px] text-gold/60 tracking-[0.2em] uppercase">
                    Prayer Tower Complex
                  </p>
                </div>
              </>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-[12px] tracking-[0.15em] uppercase transition-all duration-300 rounded-lg",
                  pathname === link.href
                    ? "text-gold bg-gold/[0.06]"
                    : "text-warm-white/60 hover:text-warm-white hover:bg-white/[0.05]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link href="/booking" className="hidden md:inline-flex">
              <Button size="sm" className="bg-gold/90 text-luxury hover:bg-gold font-semibold px-6 text-[11px] tracking-[0.15em] uppercase h-9 rounded-xl shadow-[0_4px_15px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.3)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300">
                Book Now
              </Button>
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-warm-white/80 hover:text-warm-white transition-colors"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-luxury"
          >
            <div className="flex flex-col items-center justify-center min-h-screen px-8 pt-[72px] pb-12">
              <nav className="flex flex-col items-center gap-1 w-full max-w-sm">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    className="w-full"
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block text-center py-3.5 text-lg tracking-wide transition-colors",
                        pathname === link.href ? "text-gold" : "text-warm-white/60 hover:text-warm-white"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.25 }}
                  className="w-full pt-6 space-y-3"
                >
                  <div className="h-px bg-gold/10 mb-4" />
                  <Link href="/booking" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full rounded-2xl border border-white/[0.15] bg-white/[0.07] backdrop-blur-2xl text-gold hover:bg-gold/[0.12] hover:border-gold/40 hover:shadow-[0_8px_30px_rgba(212,175,55,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98] h-12 tracking-[0.1em] uppercase text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300">
                      Book Now
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="flex flex-col items-center gap-2 pt-8 text-xs text-warm-muted"
                >
                  <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-gold transition-colors">
                    <Phone className="h-3 w-3" />{SITE.phone}
                  </a>
                  <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-gold transition-colors">
                    <Mail className="h-3 w-3" />{SITE.email}
                  </a>
                </motion.div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
