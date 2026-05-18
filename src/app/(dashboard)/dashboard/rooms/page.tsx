"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ROOM_STATUS_CONFIG } from "@/lib/constants";
import { DEMO_ROOMS } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/format";
import { BedDouble, Users, LayoutGrid, List, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RoomsPage() {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [buildingFilter, setBuildingFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const buildings = [...new Set(DEMO_ROOMS.map((r) => r.building))];

  const filtered = DEMO_ROOMS.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (buildingFilter !== "ALL" && r.building !== buildingFilter) return false;
    if (search && !r.number.toLowerCase().includes(search.toLowerCase()) && !r.guestName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusCounts = DEMO_ROOMS.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <PageHeader title="Room Management" description="Manage room status, availability, and assignments" action={{ label: "Add Room" }} />

      {/* Status summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(ROOM_STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? "ALL" : key)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              statusFilter === key ? "ring-2 ring-primary ring-offset-1" : "",
              cfg.bgColor, cfg.color
            )}
          >
            {cfg.label}
            <span className="font-bold">{statusCounts[key] || 0}</span>
          </button>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search rooms..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={buildingFilter} onValueChange={(v) => setBuildingFilter(v ?? "ALL")}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Building" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Buildings</SelectItem>
            {buildings.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex border rounded-lg overflow-hidden">
          <Button variant={view === "grid" ? "default" : "ghost"} size="sm" onClick={() => setView("grid")} className="rounded-none">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={view === "table" ? "default" : "ghost"} size="sm" onClick={() => setView("table")} className="rounded-none">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((room) => {
            const cfg = ROOM_STATUS_CONFIG[room.status];
            return (
              <Card key={room.id} className={cn("border-2 hover:shadow-md transition-all cursor-pointer", cfg?.bgColor)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">{room.number}</span>
                    <BedDouble className={cn("h-4 w-4", cfg?.color)} />
                  </div>
                  <StatusBadge status={room.status} config={ROOM_STATUS_CONFIG} className="mb-2" />
                  <p className="text-xs text-muted-foreground truncate">{room.type.replace(/_/g, " ")}</p>
                  <p className="text-xs font-medium mt-1">{formatCurrency(room.price)}/night</p>
                  {room.guestName && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {room.guestName}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Room</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Building</th>
                  <th className="text-left p-3 font-medium">Floor</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Price</th>
                  <th className="text-left p-3 font-medium">Guest</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((room) => (
                  <tr key={room.id} className="border-b hover:bg-muted/30 cursor-pointer">
                    <td className="p-3 font-bold">{room.number}</td>
                    <td className="p-3">{room.type.replace(/_/g, " ")}</td>
                    <td className="p-3">{room.building}</td>
                    <td className="p-3">{room.floor}</td>
                    <td className="p-3"><StatusBadge status={room.status} config={ROOM_STATUS_CONFIG} /></td>
                    <td className="p-3">{formatCurrency(room.price)}</td>
                    <td className="p-3 text-muted-foreground">{room.guestName || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
