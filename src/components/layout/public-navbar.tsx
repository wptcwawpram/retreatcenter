"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Menu, Phone, Mail, Shield, ChevronRight } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site-data";

export function PublicNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      {/* ── Main navbar ── */}
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-500",
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-100"
            : "bg-white"
        )}
      >
        <div className="container mx-auto flex h-[70px] items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-burnt flex items-center justify-center">
              <span className="text-white font-bold text-sm tracking-wider">W</span>
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-playfair)] text-[15px] font-bold tracking-wide text-neutral-900 leading-tight">
                WARRIORS
              </h1>
              <p className="text-[8px] text-burnt tracking-[0.18em] uppercase font-semibold">
                Prayer Tower Complex
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-2 text-[13px] font-medium transition-colors duration-200 rounded-md",
                  pathname === link.href
                    ? "text-burnt bg-burnt/5"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hidden xl:flex items-center gap-2 text-[13px] text-neutral-500 hover:text-burnt transition-colors mr-2">
              <Phone className="h-3.5 w-3.5" />
              {SITE.phone}
            </a>
            <Link href="/dashboard" className="hidden md:inline-flex">
              <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 gap-1.5 text-xs">
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Button>
            </Link>
            <Link href="/booking" className="hidden md:inline-flex">
              <Button size="sm" className="bg-burnt hover:bg-burnt-dark text-white font-semibold shadow-md shadow-burnt/20 gap-1.5 px-5 text-xs">
                Book Now
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
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

      {/* Spacer for fixed navbar */}
      <div className="h-[70px]" />

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-white"
          >
            <div className="flex flex-col items-center justify-center min-h-screen px-8 pt-[70px] pb-12">
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
                        "block text-center py-3 text-lg font-medium transition-colors rounded-xl",
                        pathname === link.href
                          ? "text-burnt bg-burnt/5"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: NAV_LINKS.length * 0.04 + 0.05, duration: 0.25 }}
                  className="w-full pt-6 space-y-3"
                >
                  <div className="h-px bg-neutral-100 mb-4" />
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full border-neutral-200 text-neutral-600 gap-2 h-12">
                      <Shield className="h-4 w-4" />
                      Admin Portal
                    </Button>
                  </Link>
                  <Link href="/booking" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-burnt hover:bg-burnt-dark text-white font-semibold h-12 mt-2">
                      Book Now
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center gap-2 pt-8 text-xs text-neutral-400"
                >
                  <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-burnt transition-colors">
                    <Phone className="h-3 w-3" />{SITE.phone}
                  </a>
                  <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-burnt transition-colors">
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
