"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ROOM_STATUS_CONFIG } from "@/lib/constants";
import { getRooms, createRoom, updateRoom, deleteRoom } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatCurrency } from "@/lib/format";
import { BedDouble, LayoutGrid, List, Search, Loader2, Edit2, Trash2, AlertCircle } from "lucide-react";
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

const roomFields: FormField[] = [
  { name: "number", label: "Room Number", required: true, placeholder: "e.g. 101" },
  { name: "name", label: "Room Name", placeholder: "e.g. Deluxe Suite" },
  { name: "type", label: "Type", type: "select", required: true, options: ROOM_TYPES },
  { name: "building", label: "Building", required: true, placeholder: "e.g. Main Block" },
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  const allRooms = rooms || [];
  const buildings = [...new Set(allRooms.map((r) => r.building))];

  const filtered = allRooms.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (buildingFilter !== "ALL" && r.building !== buildingFilter) return false;
    if (search && !r.number.toLowerCase().includes(search.toLowerCase()) && !r.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusCounts = allRooms.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
    <div className="space-y-6">
      <PageHeader title="Room Management" description="Manage room status, availability, and assignments" action={{ label: "Add Room", onClick: () => setShowAdd(true) }} />

      {/* Status summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(ROOM_STATUS_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setStatusFilter(statusFilter === key ? "ALL" : key)}
            className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all", statusFilter === key ? "ring-2 ring-primary ring-offset-1" : "", cfg.bgColor, cfg.color)}>
            {cfg.label} <span className="font-bold">{statusCounts[key] || 0}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
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
          <Button variant={view === "grid" ? "default" : "ghost"} size="sm" onClick={() => setView("grid")} className="rounded-none"><LayoutGrid className="h-4 w-4" /></Button>
          <Button variant={view === "table" ? "default" : "ghost"} size="sm" onClick={() => setView("table")} className="rounded-none"><List className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Grid View */}
      {view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((room) => {
            const cfg = ROOM_STATUS_CONFIG[room.status];
            return (
              <Card key={room.id} className={cn("border-2 hover:shadow-md transition-all cursor-pointer group relative", cfg?.bgColor)} onClick={() => setEditItem(room)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">{room.number}</span>
                    <BedDouble className={cn("h-4 w-4", cfg?.color)} />
                  </div>
                  <StatusBadge status={room.status} config={ROOM_STATUS_CONFIG} className="mb-2" />
                  <p className="text-xs text-muted-foreground truncate">{room.type.replace(/_/g, " ")}</p>
                  <p className="text-xs font-medium mt-1">{formatCurrency(Number(room.price_per_night))}/night</p>
                  <Button variant="ghost" size="icon-sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-600"
                    onClick={(e) => { e.stopPropagation(); setDeleteItem(room); }}><Trash2 className="h-3.5 w-3.5" /></Button>
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
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((room) => (
                  <tr key={room.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-bold">{room.number}</td>
                    <td className="p-3">{room.type.replace(/_/g, " ")}</td>
                    <td className="p-3">{room.building}</td>
                    <td className="p-3">{room.floor}</td>
                    <td className="p-3"><StatusBadge status={room.status} config={ROOM_STATUS_CONFIG} /></td>
                    <td className="p-3">{formatCurrency(Number(room.price_per_night))}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditItem(room)}><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon-sm" className="text-red-600" onClick={() => setDeleteItem(room)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <FormDialog open={showAdd} onOpenChange={setShowAdd} title="Add Room" description="Add a new room to the system" fields={roomFields} onSubmit={handleAdd} submitLabel="Add Room" />

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
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
