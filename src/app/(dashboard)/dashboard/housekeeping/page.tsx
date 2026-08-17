"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getHousekeepingTasks, createHousekeepingTask, updateHousekeepingStatus, deleteHousekeepingTask, getRooms, getProfiles } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { BedDouble, Clock, User, CheckCircle, Loader2, Trash2, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { sortRooms } from "@/lib/format";

const STATUS_COLS = [
  { key: "PENDING", label: "Pending", dotColor: "bg-amber-400", headerBg: "bg-amber-500/10", icon: Clock },
  { key: "IN_PROGRESS", label: "In Progress", dotColor: "bg-blue-400", headerBg: "bg-blue-500/10", icon: Sparkles },
  { key: "COMPLETED", label: "Completed", dotColor: "bg-teal-400", headerBg: "bg-teal-500/10", icon: CheckCircle },
] as const;

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  LOW: { label: "Low", color: "bg-muted/30 text-muted-foreground border-border" },
  NORMAL: { label: "Normal", color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
  HIGH: { label: "High", color: "bg-sidebar-primary/5 text-sidebar-primary border-sidebar-primary/20" },
  URGENT: { label: "Urgent", color: "bg-red-500/10 text-red-700 border-red-500/20" },
};

const TYPE_LABELS: Record<string, string> = {
  CLEANING: "Cleaning",
  DEEP_CLEAN: "Deep Clean",
  MAINTENANCE: "Maintenance",
  INSPECTION: "Inspection",
};

export default function HousekeepingPage() {
  const { data: tasks, loading, refetch } = useSupabaseQuery(() => getHousekeepingTasks(), []);
  const { data: rooms } = useSupabaseQuery(() => getRooms(), []);
  const { data: staff } = useSupabaseQuery(() => getProfiles(), []);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteItem, setDeleteItem] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const allTasks = tasks || [];
  const allRooms = rooms || [];
  const allStaff = staff || [];

  const taskCounts = useMemo(() => {
    const counts: Record<string, number> = { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0 };
    allTasks.forEach((t) => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return counts;
  }, [allTasks]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const addFields: FormField[] = [
    { name: "room_id", label: "Room", type: "select", required: true, options: sortRooms(allRooms).map((r) => ({ label: `${r.number} — ${r.name || r.type.replace(/_/g, " ")}`, value: r.id })), colSpan: 2 },
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
    <div className="space-y-5">
      <PageHeader title="Housekeeping" description="Manage room cleaning tasks and assignments" action={{ label: "New Task", onClick: () => setShowAdd(true) }} />

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUS_COLS.map((col) => {
          const colTasks = allTasks.filter((t) => t.status === col.key);
          const Icon = col.icon;
          return (
            <div key={col.key} className="space-y-2.5">
              {/* Column header */}
              <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-lg", col.headerBg)}>
                <span className={cn("h-2.5 w-2.5 rounded-full", col.dotColor)} />
                <h3 className="font-semibold text-sm flex-1">{col.label}</h3>
                <span className="text-xs font-bold text-muted-foreground bg-card/60 px-2 py-0.5 rounded-full">
                  {taskCounts[col.key]}
                </span>
              </div>

              {/* Task cards */}
              <div className="space-y-2">
                {colTasks.map((task) => {
                  const pri = PRIORITY_MAP[task.priority] ?? PRIORITY_MAP.NORMAL;
                  const next = nextStatus[task.status];
                  return (
                    <div
                      key={task.id}
                      className="rounded-xl border border-border/60 bg-card p-3.5 group relative hover:shadow-md hover:shadow-black/[0.03] transition-all"
                    >
                      {/* Room + Priority */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BedDouble className="h-4 w-4 text-muted-foreground" />
                          <span className="font-bold text-sm">{task.room?.number ?? "—"}</span>
                        </div>
                        <Badge className={cn("text-[10px] border", pri.color)}>{pri.label}</Badge>
                      </div>

                      {/* Type */}
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
                        {TYPE_LABELS[task.type] ?? task.type.replace(/_/g, " ")}
                      </p>

                      {/* Notes */}
                      {task.notes && (
                        <p className="text-xs text-foreground/80 mb-2 line-clamp-2">{task.notes}</p>
                      )}

                      {/* Assignee */}
                      {task.assignee?.full_name && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2.5">
                          <div className="h-5 w-5 rounded-full bg-primary/8 flex items-center justify-center text-[8px] font-bold text-primary">
                            {task.assignee.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          {task.assignee.full_name}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        {next && (
                          <Button variant="outline" size="sm" className="flex-1 text-xs h-7 gap-1" onClick={() => handleStatusChange(task.id, next)}>
                            <ArrowRight className="h-3 w-3" />
                            {next === "IN_PROGRESS" ? "Start" : "Complete"}
                          </Button>
                        )}
                        {col.key === "COMPLETED" && (
                          <div className="flex items-center gap-1 text-teal-500 text-xs flex-1 justify-center">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Done
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setDeleteItem(task.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {colTasks.length === 0 && (
                  <div className="border border-dashed border-border/60 rounded-xl p-6 text-center text-muted-foreground text-xs">
                    No tasks
                  </div>
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
              {deleting ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Deleting...</> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
