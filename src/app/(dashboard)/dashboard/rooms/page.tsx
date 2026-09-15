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
import { useUndoableDelete } from "@/hooks/use-undoable-delete";
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

const DEFAULT_PRICES: Record<string, number> = {
  "2_IN_1": 150,
  "3_IN_1": 180,
  "4_IN_1": 200,
  "6_IN_1": 270,
  "SUITE_FAN": 350,
  "SUITE_AC": 750,
  "APARTMENT": 0,
  "KITCHEN": 0,
};

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
  const { pendingIds, scheduleDelete } = useUndoableDelete(refetch);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Edit form state
  const [editNumber, setEditNumber] = useState("");
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("2_IN_1");
  const [editBuilding, setEditBuilding] = useState("");
  const [editFloor, setEditFloor] = useState(0);
  const [editCapacity, setEditCapacity] = useState(2);
  const [editBeds, setEditBeds] = useState(1);
  const [editPrice, setEditPrice] = useState(0);
  const [editStatus, setEditStatus] = useState("AVAILABLE");
  const [editHasAc, setEditHasAc] = useState(false);
  const [editHasTv, setEditHasTv] = useState(false);
  const [editHasFridge, setEditHasFridge] = useState(false);
  const [editDesc, setEditDesc] = useState("");

  const openEdit = (room: Room) => {
    setEditItem(room);
    setEditNumber(room.number);
    setEditName(room.name || "");
    setEditType(room.type);
    setEditBuilding(room.building);
    setEditFloor(room.floor || 0);
    setEditCapacity(room.capacity || 2);
    setEditBeds(room.beds || 1);
    setEditPrice(Number(room.price_per_night) || 0);
    setEditStatus(room.status);
    setEditHasAc(room.has_ac || false);
    setEditHasTv(room.has_tv || false);
    setEditHasFridge(room.has_fridge || false);
    setEditDesc(room.description || "");
  };

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

  const allRooms = (rooms || []).filter((r) => !pendingIds.has(r.id));
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
      price_per_night: 0,
      status: "AVAILABLE",
      amenities: [],
      has_ac: !!values.has_ac,
      has_tv: !!values.has_tv,
      has_fridge: !!values.has_fridge,
      description: (values.description as string) || null,
    });
    refetch();
  };

  const handleEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await updateRoom(editItem.id, {
        number: editNumber,
        name: editName || "",
        type: editType as Room["type"],
        building: editBuilding,
        floor: editFloor,
        capacity: editCapacity,
        beds: editBeds,
        price_per_night: editPrice,
        status: editStatus as Room["status"],
        has_ac: editHasAc,
        has_tv: editHasTv,
        has_fridge: editHasFridge,
        description: editDesc || null,
      });
      setEditItem(null);
      refetch();
    } catch { alert("Failed to update room"); }
    finally { setSaving(false); }
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    const item = deleteItem;
    setDeleteItem(null);
    scheduleDelete({ id: item.id, label: `Room ${item.number}`, performDelete: () => deleteRoom(item.id) });
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
                onClick={() => openEdit(room)}
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
                      <Button variant="ghost" size="icon-xs" onClick={() => openEdit(room)}><Edit2 className="h-3.5 w-3.5" /></Button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) setEditItem(null); }}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative z-10 w-full max-w-[calc(100%-2rem)] sm:max-w-lg rounded-xl bg-popover p-5 text-sm text-popover-foreground ring-1 ring-foreground/10 shadow-xl animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-base font-semibold flex items-center gap-2"><Edit2 className="h-4 w-4" />Edit Room {editItem.number}</h2>
              <button onClick={() => setEditItem(null)} className="rounded-md p-1 hover:bg-muted transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Room Number</label>
                  <Input value={editNumber} onChange={(e) => setEditNumber(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Room Name</label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="e.g. Deluxe Suite" className="h-9" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Type</label>
                  <select
                    value={editType}
                    onChange={(e) => {
                      const t = e.target.value;
                      setEditType(t);
                      const defaultPrice = DEFAULT_PRICES[t];
                      if (defaultPrice !== undefined && defaultPrice > 0) setEditPrice(defaultPrice);
                    }}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {ROOM_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Price / Night (GH₵)</label>
                  <Input type="number" value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} min={0} step={10} className="h-9" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Building</label>
                  <Input value={editBuilding} onChange={(e) => setEditBuilding(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Status</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {Object.entries(ROOM_STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Floor</label>
                  <Input type="number" value={editFloor} onChange={(e) => setEditFloor(Number(e.target.value))} min={0} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Capacity</label>
                  <Input type="number" value={editCapacity} onChange={(e) => setEditCapacity(Number(e.target.value))} min={1} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Beds</label>
                  <Input type="number" value={editBeds} onChange={(e) => setEditBeds(Number(e.target.value))} min={1} className="h-9" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={editHasAc} onChange={(e) => setEditHasAc(e.target.checked)} className="h-4 w-4 rounded border-border" />
                  Air Conditioning
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={editHasTv} onChange={(e) => setEditHasTv(e.target.checked)} className="h-4 w-4 rounded border-border" />
                  TV
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={editHasFridge} onChange={(e) => setEditHasFridge(e.target.checked)} className="h-4 w-4 rounded border-border" />
                  Fridge
                </label>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Description</label>
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
            </div>
            <div className="-mx-5 -mb-5 mt-4 flex items-center rounded-b-xl border-t bg-muted/50 p-4">
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-1.5" onClick={() => setDeleteItem(editItem)}>
                <Trash2 className="h-3.5 w-3.5" />Delete
              </Button>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" onClick={() => setEditItem(null)} disabled={saving}>Cancel</Button>
                <Button onClick={handleEdit} disabled={saving || !editNumber || !editBuilding}>
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Saving...</> : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Room</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p>Delete room <strong>{deleteItem?.number}</strong>? You&apos;ll have a few seconds to undo.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
