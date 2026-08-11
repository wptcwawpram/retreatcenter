"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Menu, Phone, Mail, MapPin, Shield, ChevronRight } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site-data";

export function PublicNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isHome = pathname === "/";

  return (
    <>
      {/* ── Top contact bar ── */}
      <div className="hidden lg:block bg-charcoal text-neutral-400 text-[11px] py-2.5 border-b border-white/5">
        <div className="container mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-gold transition-colors duration-300">
              <Phone className="h-3 w-3 text-gold/50" />
              {SITE.phone}
            </a>
            <a href={`mailto:${SITE.email}`} className="flex items-center gap-1.5 hover:text-gold transition-colors duration-300">
              <Mail className="h-3 w-3 text-gold/50" />
              {SITE.email}
            </a>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-500">
            <MapPin className="h-3 w-3 text-gold/50" />
            {SITE.address}
          </div>
        </div>
      </div>

      {/* ── Main navbar ── */}
      <motion.header
        initial={false}
        animate={{
          backgroundColor: scrolled ? "rgba(28, 28, 28, 0.97)" : isHome ? "rgba(28, 28, 28, 0)" : "rgba(28, 28, 28, 0.97)",
          backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={cn(
          "sticky top-0 z-50 w-full",
          scrolled && "shadow-2xl shadow-black/30 border-b border-white/[0.04]"
        )}
      >
        <div className="container mx-auto flex h-[76px] items-center justify-between px-6">
          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-3.5 group relative z-10">
            <div className="relative">
              <motion.div
                whileHover={{ rotate: 50, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-10 h-10 rotate-45 rounded-[3px] bg-gradient-to-br from-gold via-gold-dark to-gold shadow-lg shadow-gold/20"
              />
              <span className="absolute inset-0 flex items-center justify-center text-charcoal font-bold text-xs tracking-widest pointer-events-none">
                W
              </span>
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-playfair)] text-[17px] font-bold tracking-[0.04em] text-white leading-tight">
                WARRIORS
              </h1>
              <p className="text-[9px] text-gold/60 tracking-[0.2em] uppercase font-medium">
                Prayer Tower Complex
              </p>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-[12px] font-medium tracking-[0.12em] uppercase group"
              >
                <span className={cn(
                  "transition-colors duration-300",
                  pathname === link.href ? "text-gold" : "text-neutral-400 group-hover:text-white"
                )}>
                  {link.label}
                </span>
                <motion.span
                  className="absolute bottom-0 left-4 right-4 h-[1.5px] bg-gold origin-left"
                  initial={false}
                  animate={{ scaleX: pathname === link.href ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              </Link>
            ))}
          </nav>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hidden md:inline-flex">
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-500 hover:text-white hover:bg-white/5 gap-1.5 text-xs font-medium transition-all duration-300"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Button>
            </Link>
            <Link href="/booking" className="hidden md:inline-flex">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="sm"
                  className="bg-gold hover:bg-gold-dark text-charcoal font-semibold shadow-lg shadow-gold/15 transition-all duration-300 gap-1.5 px-5 text-xs tracking-wide"
                >
                  Book Now
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            </Link>

            {/* ── Mobile toggle ── */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden relative z-50 w-10 h-10 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ── Fullscreen mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-charcoal/[0.98] backdrop-blur-xl"
          >
            <div className="flex flex-col items-center justify-center min-h-screen px-8 py-20">
              <nav className="flex flex-col items-center gap-2 w-full max-w-sm">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" }}
                    className="w-full"
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block text-center py-3.5 text-lg font-medium tracking-wide transition-colors rounded-xl",
                        pathname === link.href
                          ? "text-gold bg-gold/5"
                          : "text-neutral-300 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: NAV_LINKS.length * 0.05 + 0.1, duration: 0.3 }}
                  className="w-full pt-6 space-y-3"
                >
                  <div className="h-px bg-white/5 mb-4" />
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 gap-2 h-12">
                      <Shield className="h-4 w-4" />
                      Admin Portal
                    </Button>
                  </Link>
                  <Link href="/booking" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-gold hover:bg-gold-dark text-charcoal font-semibold shadow-lg h-12 mt-2">
                      Book Now
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col items-center gap-2 pt-8 text-xs text-neutral-500"
                >
                  <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-gold transition-colors">
                    <Phone className="h-3 w-3 text-gold/40" />{SITE.phone}
                  </a>
                  <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-gold transition-colors">
                    <Mail className="h-3 w-3 text-gold/40" />{SITE.email}
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
