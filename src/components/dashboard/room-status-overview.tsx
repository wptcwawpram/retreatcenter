"use client";

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

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-teal-500",
  OCCUPIED: "bg-blue-500",
  CLEANING: "bg-orange-400",
  MAINTENANCE: "bg-red-500",
  RESERVED: "bg-purple-500",
};

const statusDotColors: Record<string, string> = {
  AVAILABLE: "bg-teal-400",
  OCCUPIED: "bg-blue-400",
  CLEANING: "bg-orange-400",
  MAINTENANCE: "bg-red-400",
  RESERVED: "bg-purple-400",
};

export function RoomStatusOverview({ data, totalRooms }: RoomStatusOverviewProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">Room Status</h3>

      {/* Visual bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-muted/50 mb-5">
        {data.map((item) => {
          const pct = totalRooms > 0 ? (item.count / totalRooms) * 100 : 0;
          if (pct === 0) return null;
          return (
            <div
              key={item.status}
              className={cn("transition-all", statusColors[item.status] || "bg-gray-400")}
              style={{ width: `${pct}%` }}
              title={`${item.status}: ${item.count}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {data.map((item) => {
          const config = ROOM_STATUS_CONFIG[item.status];
          const pct = totalRooms > 0 ? Math.round((item.count / totalRooms) * 100) : 0;
          return (
            <div key={item.status} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={cn("h-2.5 w-2.5 rounded-full", statusDotColors[item.status] || "bg-gray-400")} />
                <span className="text-sm text-foreground/80">{config?.label ?? item.status}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{item.count}</span>
                <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
