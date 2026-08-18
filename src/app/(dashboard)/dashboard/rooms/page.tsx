"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ROOM_STATUS_CONFIG } from "@/lib/constants";
import { getRooms, createRoom, updateRoom, updateRoomStatus, deleteRoom } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatCurrency, roomSortKey } from "@/lib/format";
import {
  BedDouble, LayoutGrid, List, Search, Loader2, Edit2, Trash2, AlertCircle,
  Wind, Tv, Refrigerator, Users, CheckCircle, Database, Download,
} from "lucide-react";
import { downloadCSV } from "@/lib/export-csv";
import { cn } from "@/lib/utils";
import type { Room } from "@/lib/supabase/types";

const ROOM_TYPES = [
  { label: "2 in 1", value: "2_IN_1" },
  { label: "3 in 1", value: "3_IN_1" },
  { label: "4 in 1", value: "4_IN_1" },
  { label: "6 in 1", value: "6_IN_1" },
  { label: "Suite (Fan)", value: "SUITE_FAN" },
  { label: "Suite (AC)", value: "SUITE_AC" },
  { label: "Apartment", value: "APARTMENT" },
  { label: "Kitchen", value: "KITCHEN" },
];

const STATUS_DOT: Record<string, string> = {
  AVAILABLE: "bg-teal-400",
  OCCUPIED: "bg-blue-400",
  CLEANING: "bg-orange-400",
  MAINTENANCE: "bg-red-400",
  RESERVED: "bg-purple-400",
  BLOCKED: "bg-gray-400",
  DIRTY: "bg-amber-500",
  AWAITING_INSPECTION: "bg-indigo-400",
};

const STATUS_CARD_BG: Record<string, string> = {
  AVAILABLE: "border-teal-500/15 hover:border-teal-500/30",
  OCCUPIED: "border-blue-500/20 hover:border-blue-500/30",
  CLEANING: "border-orange-500/20 hover:border-orange-500/30",
  MAINTENANCE: "border-red-500/20 hover:border-red-500/30",
  RESERVED: "border-purple-500/20 hover:border-purple-500/30",
  BLOCKED: "border-gray-500/20 hover:border-gray-500/30",
  DIRTY: "border-amber-500/20 hover:border-amber-500/30",
  AWAITING_INSPECTION: "border-indigo-500/20 hover:border-indigo-500/30",
};

const roomFields: FormField[] = [
  { name: "number", label: "Room Number", required: true, placeholder: "e.g. 101" },
  { name: "name", label: "Room Name", placeholder: "e.g. Deluxe Suite" },
  { name: "type", label: "Type", type: "select", required: true, options: ROOM_TYPES },
  { name: "building", label: "Building", required: true, placeholder: "e.g. Faith Block" },
  { name: "floor", label: "Floor", type: "number", defaultValue: 0, min: 0 },
  { name: "capacity", label: "Capacity", type: "number", defaultValue: 2, min: 1 },
  { name: "beds", label: "Beds", type: "number", defaultValue: 1, min: 1 },
  { name: "price_per_night", label: "Price/Night (GH₵)", type: "number", required: true, min: 0, step: 0.01 },
  { name: "has_ac", label: "Has Air Conditioning", type: "checkbox" },
  { name: "has_tv", label: "Has TV", type: "checkbox" },
  { name: "has_fridge", label: "Has Fridge", type: "checkbox" },
  { name: "description", label: "Description", type: "textarea", colSpan: 2 },
];

export default function RoomsPage() {
  const { data: rooms, loading, refetch } = useSupabaseQuery(() => getRooms(), []);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [buildingFilter, setBuildingFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<Room | null>(null);
  const [deleteItem, setDeleteItem] = useState<Room | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/rooms/seed", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to seed rooms");
        return;
      }
      refetch();
    } catch {
      alert("Failed to seed rooms");
    } finally {
      setSeeding(false);
    }
  };

  const handleQuickStatus = async (room: Room, status: Room["status"]) => {
    try {
      await updateRoomStatus(room.id, status);
      refetch();
    } catch {
      alert("Failed to update status");
    }
  };

  const allRooms = rooms || [];
  const buildings = useMemo(() => [...new Set(allRooms.map((r) => r.building))], [allRooms]);

  const [sortBy, setSortBy] = useState<"default" | "type" | "status" | "building">("default");

  const filtered = useMemo(() => {
    const numSort = roomSortKey;
    const buildingOrder = (b: string) => b === "Holy Family" ? 2 : b === "Main Building" ? 0 : 1;
    const typeOrder = (t: string) => {
      const order: Record<string, number> = { "2_IN_1": 0, "3_IN_1": 1, "4_IN_1": 2, "SUITE_FAN": 3, "SUITE_AC": 4, "6_IN_1": 5, "APARTMENT": 6, "KITCHEN": 7 };
      return order[t] ?? 99;
    };

    const list = allRooms.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (buildingFilter !== "ALL" && r.building !== buildingFilter) return false;
      if (search && !r.number.toLowerCase().includes(search.toLowerCase()) && !r.name?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    switch (sortBy) {
      case "type": return list.sort((a, b) => typeOrder(a.type) - typeOrder(b.type) || numSort(a.number) - numSort(b.number));
      case "status": return list.sort((a, b) => a.status.localeCompare(b.status) || numSort(a.number) - numSort(b.number));
      case "building": return list.sort((a, b) => a.building.localeCompare(b.building) || numSort(a.number) - numSort(b.number));
      default: return list.sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999) || buildingOrder(a.building) - buildingOrder(b.building) || numSort(a.number) - numSort(b.number));
    }
  }, [allRooms, statusFilter, buildingFilter, search, sortBy]);

  const statusCounts = useMemo(() => allRooms.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>), [allRooms]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const handleAdd = async (values: Record<string, unknown>) => {
    await createRoom({
      number: values.number as string,
      name: (values.name as string) || "",
      type: values.type as Room["type"],
      building: values.building as string,
      floor: Number(values.floor) || 0,
      capacity: Number(values.capacity) || 2,
      beds: Number(values.beds) || 1,
      price_per_night: Number(values.price_per_night) || 0,
      status: "AVAILABLE",
      amenities: [],
      has_ac: !!values.has_ac,
      has_tv: !!values.has_tv,
      has_fridge: !!values.has_fridge,
      description: (values.description as string) || null,
    });
    refetch();
  };

  const handleEdit = async (values: Record<string, unknown>) => {
    if (!editItem) return;
    await updateRoom(editItem.id, {
      number: values.number as string,
      name: (values.name as string) || "",
      type: values.type as Room["type"],
      building: values.building as string,
      floor: Number(values.floor) || 0,
      capacity: Number(values.capacity) || 2,
      beds: Number(values.beds) || 1,
      price_per_night: Number(values.price_per_night) || 0,
      status: (values.status as Room["status"]) || editItem.status,
      has_ac: !!values.has_ac,
      has_tv: !!values.has_tv,
      has_fridge: !!values.has_fridge,
      description: (values.description as string) || null,
    });
    setEditItem(null);
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try { await deleteRoom(deleteItem.id); setDeleteItem(null); refetch(); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Rooms" description="Manage room status, availability, and assignments" action={{ label: "Add Room", onClick: () => setShowAdd(true) }}>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
          downloadCSV("rooms", ["Number", "Name", "Type", "Building", "Floor", "Status", "Capacity", "Beds", "Price/Night", "AC", "TV", "Fridge"], filtered.map((r) => [
            r.number, r.name ?? "", r.type, r.building, r.floor, r.status, r.capacity, r.beds, Number(r.price_per_night), r.has_ac ? "Yes" : "No", r.has_tv ? "Yes" : "No", r.has_fridge ? "Yes" : "No",
          ]));
        }}>
          <Download className="h-3.5 w-3.5" />Export CSV
        </Button>
      </PageHeader>

      {allRooms.length < 24 && !loading && (
        <div className="text-center py-10 border border-dashed border-border/60 rounded-xl bg-card">
          <Database className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-1">{allRooms.length === 0 ? "No rooms configured" : `Only ${allRooms.length} room${allRooms.length > 1 ? "s" : ""} found`}</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            {allRooms.length > 0 ? "Replace with" : "Seed"} the full WPTC room inventory: 21 main rooms (2-in-1, 4-in-1, 6-in-1) + 3 Holy Family apartments.
          </p>
          <Button onClick={handleSeed} disabled={seeding} className="gap-2">
            {seeding ? <><Loader2 className="h-4 w-4 animate-spin" />Seeding rooms...</> : <><Database className="h-4 w-4" />{allRooms.length > 0 ? "Replace with Full Inventory" : "Seed Room Inventory"}</>}
          </Button>
        </div>
      )}

      {/* Status pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
            statusFilter === "ALL"
              ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
              : "bg-card text-muted-foreground border-border/60 hover:bg-muted/50"
          )}
        >
          All <span className="ml-1 text-[10px] font-bold">{allRooms.length}</span>
        </button>
        {Object.entries(ROOM_STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? "ALL" : key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              statusFilter === key
                ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                : "bg-card text-muted-foreground border-border/60 hover:bg-muted/50"
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[key])} />
            {cfg.label}
            <span className="text-[10px] font-bold">{statusCounts[key] || 0}</span>
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search rooms..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={buildingFilter} onValueChange={(v) => setBuildingFilter(v ?? "ALL")}>
          <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Building" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Buildings</SelectItem>
            {buildings.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="default">By Number</SelectItem>
            <SelectItem value="type">By Type</SelectItem>
            <SelectItem value="status">By Status</SelectItem>
            <SelectItem value="building">By Building</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border border-border/60 rounded-lg overflow-hidden">
          <Button variant={view === "grid" ? "default" : "ghost"} size="sm" onClick={() => setView("grid")} className="rounded-none h-9 w-9 p-0">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={view === "table" ? "default" : "ghost"} size="sm" onClick={() => setView("table")} className="rounded-none h-9 w-9 p-0">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
          {filtered.map((room) => {
            const cfg = ROOM_STATUS_CONFIG[room.status];
            return (
              <div
                key={room.id}
                onClick={() => setEditItem(room)}
                className={cn(
                  "relative rounded-xl border bg-card p-3.5 cursor-pointer group transition-all hover:shadow-md hover:shadow-black/[0.03]",
                  STATUS_CARD_BG[room.status]
                )}
              >
                {/* Room number + status dot */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg tracking-tight">{room.number}</span>
                  <span className={cn("h-2.5 w-2.5 rounded-full ring-2 ring-card", STATUS_DOT[room.status])} />
                </div>

                {/* Status label */}
                <p className={cn("text-[10px] font-semibold uppercase tracking-wider mb-2", cfg?.color)}>{cfg?.label}</p>

                {/* Type */}
                <p className="text-[11px] text-muted-foreground mb-1.5">{room.type.replace(/_/g, " ")}</p>

                {/* Price */}
                <p className="text-xs font-semibold tabular-nums">{formatCurrency(Number(room.price_per_night))}<span className="text-muted-foreground font-normal">/night</span></p>

                {/* Amenity icons */}
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex items-center gap-0.5 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span className="text-[10px]">{room.capacity}</span>
                  </div>
                  {room.has_ac && <Wind className="h-3 w-3 text-blue-400" />}
                  {room.has_tv && <Tv className="h-3 w-3 text-muted-foreground" />}
                  {room.has_fridge && <Refrigerator className="h-3 w-3 text-muted-foreground" />}
                </div>

                {/* Quick actions */}
                <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(room.status === "CLEANING" || room.status === "MAINTENANCE" || room.status === "DIRTY" || room.status === "AWAITING_INSPECTION" || room.status === "BLOCKED") && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-teal-500"
                      title="Mark Available"
                      onClick={(e) => { e.stopPropagation(); handleQuickStatus(room, "AVAILABLE"); }}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {room.status === "AVAILABLE" && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-orange-500"
                      title="Mark Cleaning"
                      onClick={(e) => { e.stopPropagation(); handleQuickStatus(room, "CLEANING"); }}
                    >
                      <BedDouble className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-red-600"
                    onClick={(e) => { e.stopPropagation(); setDeleteItem(room); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground text-sm">No rooms match your filters</div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border/60">
                <th className="text-left p-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Room</th>
                <th className="text-left p-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="text-left p-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Building</th>
                <th className="text-center p-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Floor</th>
                <th className="text-left p-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right p-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                <th className="text-right p-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((room) => (
                <tr key={room.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-3">
                    <span className="font-bold">{room.number}</span>
                    {room.name && <span className="text-muted-foreground ml-1.5 text-xs">({room.name})</span>}
                  </td>
                  <td className="p-3 text-muted-foreground">{room.type.replace(/_/g, " ")}</td>
                  <td className="p-3">{room.building}</td>
                  <td className="p-3 text-center">{room.floor}</td>
                  <td className="p-3"><StatusBadge status={room.status} config={ROOM_STATUS_CONFIG} /></td>
                  <td className="p-3 text-right font-semibold tabular-nums">{formatCurrency(Number(room.price_per_night))}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-0.5">
                      <Button variant="ghost" size="icon-xs" onClick={() => setEditItem(room)}><Edit2 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon-xs" className="text-red-600" onClick={() => setDeleteItem(room)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No rooms match your filters</div>
          )}
        </div>
      )}

      <FormDialog open={showAdd} onOpenChange={setShowAdd} title="Add Room" fields={roomFields} onSubmit={handleAdd} submitLabel="Add Room" />

      {editItem && (
        <FormDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} title={`Edit Room ${editItem.number}`}
          fields={[
            ...roomFields,
            { name: "status", label: "Status", type: "select", options: Object.entries(ROOM_STATUS_CONFIG).map(([k, v]) => ({ label: v.label, value: k })) },
          ]}
          initialValues={editItem} onSubmit={handleEdit} isEdit />
      )}

      <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Room</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p>Delete room <strong>{deleteItem?.number}</strong>? This cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Deleting...</> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
