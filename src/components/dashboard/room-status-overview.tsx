"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROOM_STATUS_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface RoomStatusCount {
  status: string;
  count: number;
}

interface RoomStatusOverviewProps {
  data: RoomStatusCount[];
  totalRooms: number;
}

export function RoomStatusOverview({
  data,
  totalRooms,
}: RoomStatusOverviewProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Room Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item) => {
            const config = ROOM_STATUS_CONFIG[item.status];
            const percentage =
              totalRooms > 0
                ? Math.round((item.count / totalRooms) * 100)
                : 0;
            return (
              <div key={item.status} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0",
                        config?.bgColor,
                        config?.color
                      )}
                    >
                      {config?.label ?? item.status}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">
                    {item.count}{" "}
                    <span className="text-muted-foreground text-xs">
                      ({percentage}%)
                    </span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      item.status === "AVAILABLE"
                        ? "bg-emerald-500"
                        : item.status === "OCCUPIED"
                          ? "bg-blue-500"
                          : item.status === "DIRTY"
                            ? "bg-amber-500"
                            : item.status === "CLEANING"
                              ? "bg-orange-500"
                              : item.status === "MAINTENANCE"
                                ? "bg-red-500"
                                : "bg-gray-400"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
