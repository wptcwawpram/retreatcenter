"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Church, Phone, Mail } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site-data";

export function PublicNavbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Top info bar */}
      <div className="hidden md:block bg-amber-900 text-amber-50 text-xs py-2">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-5">
            <a
              href={`tel:${SITE.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-1.5 hover:text-amber-200 transition-colors"
            >
              <Phone className="h-3 w-3" />
              {SITE.phone}
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="flex items-center gap-1.5 hover:text-amber-200 transition-colors"
            >
              <Mail className="h-3 w-3" />
              {SITE.email}
            </a>
          </div>
          <p className="text-amber-200/80">{SITE.fullAddress}</p>
        </div>
      </div>

      {/* Main navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 text-amber-50 shadow-md group-hover:shadow-lg transition-shadow">
              <Church className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold leading-tight text-amber-900">
                {SITE.shortName}
              </h1>
              <p className="text-[10px] text-amber-700/70 leading-tight">
                {SITE.subtitle}
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  "hover:bg-amber-50 hover:text-amber-900",
                  pathname === link.href
                    ? "text-amber-900 font-semibold bg-amber-50"
                    : "text-gray-600"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            <Link href="/booking">
              <Button
                size="sm"
                className="hidden sm:inline-flex bg-amber-800 hover:bg-amber-900 text-white shadow-md"
              >
                Book Now
              </Button>
            </Link>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-amber-800"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                }
              />
              <SheetContent side="right" className="w-72">
                <div className="flex items-center gap-3 mb-6 mt-4">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 text-amber-50">
                    <Church className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-amber-900">
                      {SITE.shortName}
                    </h2>
                    <p className="text-[10px] text-amber-700/70">
                      {SITE.subtitle}
                    </p>
                  </div>
                </div>
                <nav className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                        "hover:bg-amber-50",
                        pathname === link.href
                          ? "text-amber-900 font-semibold bg-amber-50"
                          : "text-gray-600"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t my-3" />
                  <Link href="/booking">
                    <Button className="w-full bg-amber-800 hover:bg-amber-900">
                      Book Now
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
