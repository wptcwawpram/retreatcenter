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
  ImageIcon,
  ClipboardCheck,
  Blocks,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useSiteLogo } from "@/lib/use-site-logo";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ROLE_DASHBOARD_ACCESS } from "@/lib/constants";

function getPageKey(href: string): string {
  const parts = href.replace("/dashboard", "").split("/").filter(Boolean);
  return parts[0] || "dashboard";
}

const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Rooms", href: "/dashboard/rooms", icon: BedDouble },
      { label: "Bookings", href: "/dashboard/bookings", icon: CalendarCheck },
      { label: "Check-in/out", href: "/dashboard/checkin", icon: ClipboardCheck },
      { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
      { label: "Guests", href: "/dashboard/guests", icon: Users },
      { label: "Housekeeping", href: "/dashboard/housekeeping", icon: SprayCan },
      { label: "Events", href: "/dashboard/events", icon: Calendar },
    ],
  },
  {
    label: "ACCOUNTING",
    items: [
      { label: "Accounting", href: "/dashboard/finance", icon: TrendingUp },
      { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
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
    items: [
      { label: "Messaging", href: "/dashboard/messaging", icon: Send },
    ],
  },
  {
    label: "",
    items: [
      { label: "Form Builder", href: "/dashboard/form-builder", icon: Blocks },
      { label: "Site Images", href: "/dashboard/images", icon: ImageIcon },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const siteLogo = useSiteLogo();
  const { role } = useCurrentUser();
  const allowedPages = ROLE_DASHBOARD_ACCESS[role || "super_admin"] || ["*"];
  const canAccess = (href: string) => allowedPages.includes("*") || allowedPages.includes(getPageKey(href));

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 relative",
        collapsed ? "w-[68px]" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        {siteLogo ? (
          <Image src={siteLogo} alt="WPTC" width={collapsed ? 40 : 160} height={48} className={cn("object-contain shrink-0", collapsed ? "h-10 w-10" : "h-12 w-auto")} unoptimized />
        ) : (
          <>
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-sidebar-primary shrink-0">
              <Church className="h-4.5 w-4.5 text-sidebar-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="text-sm font-bold leading-tight text-sidebar-primary tracking-wide">WPTC</h1>
                <p className="text-[10px] text-sidebar-foreground/50 leading-tight">
                  Retreat Centre
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] z-10 flex items-center justify-center w-6 h-6 rounded-full bg-sidebar border-2 border-background shadow-sm hover:bg-sidebar-accent transition-colors"
      >
        <ChevronLeft className={cn("h-3 w-3 text-sidebar-foreground/70 transition-transform", collapsed && "rotate-180")} />
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5 scrollbar-thin">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => canAccess(item.href));
          if (visibleItems.length === 0) return null;
          return (
          <div key={group.label || "bottom"}>
            {group.label && !collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {group.label}
              </p>
            )}
            {!group.label && !collapsed && (
              <div className="border-t border-sidebar-border pt-3 mt-2" />
            )}
            <div className="space-y-0.5">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
                      isActive
                        ? "bg-sidebar-primary/15 text-sidebar-primary shadow-sm shadow-sidebar-primary/5"
                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60",
                      collapsed && "justify-center px-0 py-2.5"
                    )}
                  >
                    <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {isActive && !collapsed && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          );
        })}
      </nav>

      {/* Version tag */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-sidebar-border">
          <p className="text-[10px] text-sidebar-foreground/30">WPTC HMS v1.0</p>
        </div>
      )}
    </aside>
  );
}
