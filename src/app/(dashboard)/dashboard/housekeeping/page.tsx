"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getHousekeepingTasks, createHousekeepingTask, updateHousekeepingStatus, deleteHousekeepingTask, getRooms, getProfiles } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { BedDouble, Clock, User, CheckCircle, Loader2, Trash2, ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLS = [
  { key: "PENDING", label: "Pending", color: "bg-amber-500", icon: Clock },
  { key: "IN_PROGRESS", label: "In Progress", color: "bg-blue-500", icon: Loader2 },
  { key: "COMPLETED", label: "Completed", color: "bg-emerald-500", icon: CheckCircle },
] as const;

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  LOW: { label: "Low", color: "bg-gray-50 text-gray-700 border-gray-200" },
  NORMAL: { label: "Normal", color: "bg-blue-50 text-blue-700 border-blue-200" },
  HIGH: { label: "High", color: "bg-amber-50 text-amber-700 border-amber-200" },
  URGENT: { label: "Urgent", color: "bg-red-50 text-red-700 border-red-200" },
};

export default function HousekeepingPage() {
  const { data: tasks, loading, refetch } = useSupabaseQuery(() => getHousekeepingTasks(), []);
  const { data: rooms } = useSupabaseQuery(() => getRooms(), []);
  const { data: staff } = useSupabaseQuery(() => getProfiles(), []);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteItem, setDeleteItem] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  const allTasks = tasks || [];
  const allRooms = rooms || [];
  const allStaff = staff || [];

  const addFields: FormField[] = [
    { name: "room_id", label: "Room", type: "select", required: true, options: allRooms.map((r) => ({ label: `${r.number} — ${r.name || r.type.replace(/_/g, " ")}`, value: r.id })), colSpan: 2 },
    { name: "type", label: "Task Type", type: "select", required: true, options: [
      { label: "Cleaning", value: "CLEANING" }, { label: "Deep Clean", value: "DEEP_CLEAN" },
      { label: "Maintenance", value: "MAINTENANCE" }, { label: "Inspection", value: "INSPECTION" },
    ]},
    { name: "priority", label: "Priority", type: "select", required: true, defaultValue: "NORMAL", options: [
      { label: "Low", value: "LOW" }, { label: "Normal", value: "NORMAL" },
      { label: "High", value: "HIGH" }, { label: "Urgent", value: "URGENT" },
    ]},
    { name: "assigned_to", label: "Assign To", type: "select", options: allStaff.map((s) => ({ label: s.full_name, value: s.id })) },
    { name: "notes", label: "Notes", type: "textarea", colSpan: 2, placeholder: "Task details" },
  ];

  const handleAdd = async (values: Record<string, unknown>) => {
    await createHousekeepingTask({
      room_id: values.room_id as string,
      type: values.type as "CLEANING" | "DEEP_CLEAN" | "MAINTENANCE" | "INSPECTION",
      priority: values.priority as "LOW" | "NORMAL" | "HIGH" | "URGENT",
      assigned_to: (values.assigned_to as string) || null,
      status: "PENDING",
      notes: (values.notes as string) || null,
    });
    refetch();
  };

  const handleStatusChange = async (id: string, newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED") => {
    await updateHousekeepingStatus(id, newStatus);
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try { await deleteHousekeepingTask(deleteItem); setDeleteItem(null); refetch(); }
    finally { setDeleting(false); }
  };

  const nextStatus: Record<string, "IN_PROGRESS" | "COMPLETED"> = {
    PENDING: "IN_PROGRESS",
    IN_PROGRESS: "COMPLETED",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Housekeeping" description="Manage room cleaning tasks and assignments" action={{ label: "New Task", onClick: () => setShowAdd(true) }} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATUS_COLS.map((col) => {
          const colTasks = allTasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key}>
              <div className="flex items-center gap-2 mb-4">
                <div className={cn("w-3 h-3 rounded-full", col.color)} />
                <h3 className="font-semibold text-sm">{col.label}</h3>
                <Badge variant="secondary" className="ml-auto">{colTasks.length}</Badge>
              </div>
              <div className="space-y-3">
                {colTasks.map((task) => {
                  const pri = PRIORITY_MAP[task.priority] ?? PRIORITY_MAP.NORMAL;
                  const next = nextStatus[task.status];
                  return (
                    <Card key={task.id} className="hover:shadow-md transition-shadow group relative">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <BedDouble className="h-4 w-4 text-muted-foreground" />
                            <span className="font-bold">{task.room?.number ?? "—"}</span>
                          </div>
                          <Badge className={cn("text-xs border", pri.color)}>{pri.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{task.type.replace(/_/g, " ")}</p>
                        {task.notes && <p className="text-sm mb-3">{task.notes}</p>}
                        {task.assignee?.full_name && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                            <User className="h-3 w-3" />{task.assignee.full_name}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {next && (
                            <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={() => handleStatusChange(task.id, next)}>
                              <ArrowRight className="h-3 w-3 mr-1" />
                              {next === "IN_PROGRESS" ? "Start" : "Complete"}
                            </Button>
                          )}
                          <Button variant="ghost" size="icon-sm" className="text-red-600 opacity-0 group-hover:opacity-100" onClick={() => setDeleteItem(task.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {colTasks.length === 0 && (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground text-sm">No tasks</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <FormDialog open={showAdd} onOpenChange={setShowAdd} title="New Housekeeping Task" fields={addFields} onSubmit={handleAdd} submitLabel="Create Task" />

      <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Task</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p>Delete this housekeeping task? This cannot be undone.</p>
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
