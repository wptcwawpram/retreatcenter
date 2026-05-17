"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
  ChevronLeft,
  Church,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

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

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shrink-0">
          <Church className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold leading-tight truncate">WPTC</h1>
            <p className="text-[10px] text-muted-foreground leading-tight truncate">
              Management System
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto h-7 w-7 shrink-0", collapsed && "ml-0")}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          const link = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              {Icon && (
                <Icon
                  className={cn("h-4 w-4 shrink-0", isActive && "text-primary")}
                />
              )}
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger render={<div />}>
                  {link}
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return link;
        })}
      </nav>
    </aside>
  );
}
