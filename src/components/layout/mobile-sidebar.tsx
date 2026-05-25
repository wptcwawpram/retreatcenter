"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Church } from "lucide-react";
import {
  LayoutDashboard, BedDouble, CalendarCheck, SprayCan, Users,
  CreditCard, TrendingUp, MessageSquareWarning, Zap, Package,
  UserCog, Send, Calendar, BarChart3, Settings,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operations",
    items: [
      { label: "Rooms", href: "/dashboard/rooms", icon: BedDouble },
      { label: "Bookings", href: "/dashboard/bookings", icon: CalendarCheck },
      { label: "Guests", href: "/dashboard/guests", icon: Users },
      { label: "Housekeeping", href: "/dashboard/housekeeping", icon: SprayCan },
      { label: "Events", href: "/dashboard/events", icon: Calendar },
    ],
  },
  {
    label: "Financial",
    items: [
      { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
      { label: "Finance", href: "/dashboard/finance", icon: TrendingUp },
      { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Complaints", href: "/dashboard/complaints", icon: MessageSquareWarning },
      { label: "Inventory", href: "/dashboard/inventory", icon: Package },
      { label: "Employees", href: "/dashboard/employees", icon: UserCog },
      { label: "Utilities", href: "/dashboard/utilities", icon: Zap },
    ],
  },
  {
    label: "Communication",
    items: [{ label: "Messaging", href: "/dashboard/messaging", icon: Send }],
  },
  {
    label: "",
    items: [{ label: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

export function MobileSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-sidebar-primary">
          <Church className="h-4.5 w-4.5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight text-sidebar-primary tracking-wide">WPTC</h1>
          <p className="text-[10px] text-sidebar-foreground/50 leading-tight">Retreat Centre</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label || "bottom"}>
            {group.label && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {group.label}
              </p>
            )}
            {!group.label && <div className="border-t border-sidebar-border pt-3 mt-2" />}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all",
                      isActive
                        ? "bg-sidebar-primary/15 text-sidebar-primary"
                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                    )}
                  >
                    <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50")} />
                    <span>{item.label}</span>
                    {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
