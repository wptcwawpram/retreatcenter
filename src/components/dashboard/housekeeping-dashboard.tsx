"use client";

import Link from "next/link";
import {
  SprayCan, Clock, CheckCircle, Sparkles, BedDouble,
  ArrowRight, Loader2, AlertTriangle,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardStats, getHousekeepingTasks, updateHousekeepingStatus } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-50 text-gray-600 border-gray-200",
  NORMAL: "bg-blue-50 text-blue-700 border-blue-200",
  HIGH: "bg-amber-50 text-amber-700 border-amber-200",
  URGENT: "bg-red-50 text-red-700 border-red-200",
};

const TYPE_LABELS: Record<string, string> = {
  CLEANING: "Cleaning",
  DEEP_CLEAN: "Deep Clean",
  MAINTENANCE: "Maintenance",
  INSPECTION: "Inspection",
};

export function HousekeepingDashboard({ greeting }: { greeting: string }) {
  const { data: stats, loading: statsLoading } = useSupabaseQuery(() => getDashboardStats(), []);
  const { data: tasks, loading: tasksLoading, refetch } = useSupabaseQuery(() => getHousekeepingTasks(), []);

  if (statsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading housekeeping dashboard...</p>
        </div>
      </div>
    );
  }

  const s = stats || { dirtyRooms: 0, cleaningRooms: 0, totalRooms: 0, availableRooms: 0, maintenanceRooms: 0, roomStatusData: [] };
  const allTasks = tasks || [];

  const pending = allTasks.filter((t) => t.status === "PENDING");
  const inProgress = allTasks.filter((t) => t.status === "IN_PROGRESS");
  const completedToday = allTasks.filter((t) => {
    if (t.status !== "COMPLETED") return false;
    const today = new Date().toISOString().split("T")[0];
    return t.completed_at?.startsWith(today);
  });

  const handleAdvance = async (id: string, next: "IN_PROGRESS" | "COMPLETED") => {
    await updateHousekeepingStatus(id, next);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{greeting}</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Housekeeping overview &mdash; room cleaning tasks and priorities</p>
        </div>
        <Link href="/dashboard/housekeeping">
          <Button size="sm" className="gap-1.5 shadow-sm">
            <SprayCan className="h-3.5 w-3.5" />All Tasks
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Pending Tasks" value={pending.length} subtitle="Awaiting action" icon={Clock} iconClassName="bg-amber-500/10 text-amber-600" />
        <StatCard title="In Progress" value={inProgress.length} subtitle="Being cleaned" icon={Sparkles} iconClassName="bg-blue-500/10 text-blue-600" />
        <StatCard title="Completed Today" value={completedToday.length} subtitle="Finished tasks" icon={CheckCircle} iconClassName="bg-teal-500/10 text-teal-500" />
        <StatCard title="Rooms to Clean" value={s.dirtyRooms} subtitle={`${s.cleaningRooms} in cleaning`} icon={SprayCan} iconClassName="bg-orange-500/10 text-orange-600" />
      </div>

      {pending.length > 3 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p className="text-sm"><span className="font-semibold">{pending.length} tasks pending</span> &mdash; prioritize urgent and high-priority rooms</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Tasks */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />Pending ({pending.length})
            </h3>
          </div>
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
            {pending.slice(0, 8).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-semibold text-sm">{task.room?.number ?? "—"}</span>
                    <Badge className={cn("text-[10px] border", PRIORITY_COLORS[task.priority])}>{task.priority}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{TYPE_LABELS[task.type] ?? task.type}</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs h-7 gap-1 shrink-0" onClick={() => handleAdvance(task.id, "IN_PROGRESS")}>
                  <ArrowRight className="h-3 w-3" />Start
                </Button>
              </div>
            ))}
            {pending.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No pending tasks</p>}
          </div>
        </div>

        {/* In Progress Tasks */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />In Progress ({inProgress.length})
            </h3>
          </div>
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
            {inProgress.slice(0, 8).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-semibold text-sm">{task.room?.number ?? "—"}</span>
                    {task.assignee?.full_name && (
                      <span className="text-[11px] text-muted-foreground">&middot; {task.assignee.full_name}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{TYPE_LABELS[task.type] ?? task.type}</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs h-7 gap-1 shrink-0 text-teal-500 border-teal-500/20 hover:bg-teal-500/10" onClick={() => handleAdvance(task.id, "COMPLETED")}>
                  <CheckCircle className="h-3 w-3" />Done
                </Button>
              </div>
            ))}
            {inProgress.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No tasks in progress</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
