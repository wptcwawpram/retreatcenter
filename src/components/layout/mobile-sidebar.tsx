"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Church } from "lucide-react";
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  SprayCan,
  Users,
  CreditCard,
  TrendingUp,
  MessageSquareWarning,
  Zap,
  Package,
  UserCog,
  Send,
  Calendar,
  BarChart3,
  Settings,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  SprayCan,
  Users,
  CreditCard,
  TrendingUp,
  MessageSquareWarning,
  Zap,
  Package,
  UserCog,
  Send,
  Calendar,
  BarChart3,
  Settings,
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Rooms", href: "/dashboard/rooms", icon: "BedDouble" },
  { label: "Bookings", href: "/dashboard/bookings", icon: "CalendarCheck" },
  { label: "Housekeeping", href: "/dashboard/housekeeping", icon: "SprayCan" },
  { label: "Guests", href: "/dashboard/guests", icon: "Users" },
  { label: "Payments", href: "/dashboard/payments", icon: "CreditCard" },
  { label: "Finance", href: "/dashboard/finance", icon: "TrendingUp" },
  {
    label: "Complaints",
    href: "/dashboard/complaints",
    icon: "MessageSquareWarning",
  },
  { label: "Utilities", href: "/dashboard/utilities", icon: "Zap" },
  { label: "Inventory", href: "/dashboard/inventory", icon: "Package" },
  { label: "Employees", href: "/dashboard/employees", icon: "UserCog" },
  { label: "Messaging", href: "/dashboard/messaging", icon: "Send" },
  { label: "Events", href: "/dashboard/events", icon: "Calendar" },
  { label: "Reports", href: "/dashboard/reports", icon: "BarChart3" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
];

export function MobileSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
          <Church className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight">WPTC</h1>
          <p className="text-[10px] text-muted-foreground leading-tight">
            Management System
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              )}
            >
              {Icon && (
                <Icon
                  className={cn("h-4 w-4 shrink-0", isActive && "text-primary")}
                />
              )}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
