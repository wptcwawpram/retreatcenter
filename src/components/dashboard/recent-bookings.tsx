"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS_CONFIG, CURRENCY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Recent Bookings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No recent bookings
          </p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const config = BOOKING_STATUS_CONFIG[booking.status];
              return (
                <div
                  key={booking.id}
                  className="flex items-start justify-between gap-3 pb-3 border-b last:border-0 last:pb-0"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {booking.guestName}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0 shrink-0",
                          config?.bgColor,
                          config?.color
                        )}
                      >
                        {config?.label ?? booking.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {booking.bookingReference} &middot; Room{" "}
                      {booking.roomNumbers.join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(booking.checkInDate, "MMM d")} &ndash;{" "}
                      {format(booking.checkOutDate, "MMM d, yyyy")}
                    </p>
                  </div>
                  <p className="text-sm font-semibold shrink-0">
                    {CURRENCY.symbol}
                    {booking.totalAmount.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
