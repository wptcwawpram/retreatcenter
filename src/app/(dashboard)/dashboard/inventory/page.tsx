"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";

const DEMO_INVENTORY = [
  { id: "i1", item: "Bed Sheets (Double)", room: "General", quantity: 48, minStock: 20, status: "OK" },
  { id: "i2", item: "Pillows", room: "General", quantity: 64, minStock: 30, status: "OK" },
  { id: "i3", item: "Towels (Bath)", room: "General", quantity: 12, minStock: 20, status: "LOW" },
  { id: "i4", item: "Toilet Paper (Rolls)", room: "General", quantity: 80, minStock: 50, status: "OK" },
  { id: "i5", item: "Soap Bars", room: "General", quantity: 35, minStock: 40, status: "LOW" },
  { id: "i6", item: "Mattress", room: "Room 101", quantity: 2, minStock: 2, status: "OK" },
  { id: "i7", item: "Ceiling Fan", room: "Room 301", quantity: 1, minStock: 1, status: "OK" },
  { id: "i8", item: "TV Remote", room: "Room 303", quantity: 1, minStock: 1, status: "OK" },
  { id: "i9", item: "Cleaning Detergent (L)", room: "Housekeeping", quantity: 5, minStock: 10, status: "LOW" },
  { id: "i10", item: "Mop Heads", room: "Housekeeping", quantity: 3, minStock: 5, status: "LOW" },
];

type InventoryItem = (typeof DEMO_INVENTORY)[number];

export default function InventoryPage() {
  const columns: Column<InventoryItem>[] = [
    { header: "Item", accessor: (i) => <span className="font-medium">{i.item}</span> },
    { header: "Location", accessor: "room" },
    { header: "Quantity", accessor: (i) => <span className="font-bold">{i.quantity}</span>, className: "text-center" },
    { header: "Min Stock", accessor: (i) => <span className="text-muted-foreground">{i.minStock}</span>, className: "text-center" },
    { header: "Status", accessor: (i) => (
      <Badge className={i.status === "OK" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}>
        {i.status === "LOW" ? "⚠ Low Stock" : "In Stock"}
      </Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" description="Track room inventory and supplies" action={{ label: "Add Item" }} />
      <DataTable columns={columns} data={DEMO_INVENTORY} keyExtractor={(i) => i.id} total={DEMO_INVENTORY.length} emptyMessage="No items" />
    </div>
  );
}
