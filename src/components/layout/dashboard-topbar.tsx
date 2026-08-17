"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Menu, LogOut, ChevronDown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileSidebar } from "./mobile-sidebar";
import { USER_ROLE_LABELS } from "@/lib/constants";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
}

export function DashboardTopbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const roleLabel = user?.role ? (USER_ROLE_LABELS[user.role] || user.role) : "";
  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border/60 bg-card/80 backdrop-blur-xl px-4 lg:px-6 h-14">
      {/* Mobile menu trigger */}
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon-sm" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          }
        />
        <SheetContent side="left" className="p-0 w-64">
          <MobileSidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-1.5 ml-auto">
        {/* User menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 pl-2.5 pr-1.5 py-1 rounded-lg hover:bg-muted/60 transition-colors"
          >
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold leading-tight">
                {user?.full_name || "Loading..."}
              </p>
              {roleLabel && (
                <p className="text-[10px] text-muted-foreground leading-tight">{roleLabel}</p>
              )}
            </div>
            <ChevronDown className={`h-3 w-3 text-muted-foreground hidden md:block transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl border bg-card shadow-xl shadow-black/5 py-1 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
              <div className="px-3 py-2.5 border-b">
                <p className="text-sm font-semibold">{user?.full_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                {roleLabel && (
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-md">
                    {roleLabel}
                  </span>
                )}
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setShowDropdown(false); router.push("/dashboard/settings"); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {loggingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
