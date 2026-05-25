"use client";

import { BOOKING_STATUS_CONFIG, CURRENCY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RecentBooking {
  id: string;
  bookingReference: string;
  guestName: string;
  roomNumbers: string[];
  checkInDate: Date;
  checkOutDate: Date;
  status: string;
  totalAmount: number;
}

interface RecentBookingsProps {
  bookings: RecentBooking[];
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Recent Bookings</h3>
        <Link
          href="/dashboard/bookings"
          className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No recent bookings
        </p>
      ) : (
        <div className="space-y-1">
          {bookings.map((booking) => {
            const config = BOOKING_STATUS_CONFIG[booking.status];
            return (
              <div
                key={booking.id}
                className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                {/* Avatar circle */}
                <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                  {booking.guestName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{booking.guestName}</p>
                    <span className={cn(
                      "inline-flex items-center px-1.5 py-0 rounded text-[10px] font-semibold border shrink-0",
                      config?.bgColor, config?.color
                    )}>
                      {config?.label ?? booking.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {booking.bookingReference} &middot; {format(booking.checkInDate, "MMM d")} &ndash; {format(booking.checkOutDate, "MMM d")}
                  </p>
                </div>

                {/* Amount */}
                <p className="text-sm font-semibold shrink-0 tabular-nums">
                  {CURRENCY.symbol}{booking.totalAmount.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
