"use client";

import Link from "next/link";
import {
  Wrench, AlertTriangle, CheckCircle, Clock,
  BedDouble, ArrowRight, Loader2, Settings,
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

export function MaintenanceDashboard({ greeting }: { greeting: string }) {
  const { data: stats, loading: statsLoading } = useSupabaseQuery(() => getDashboardStats(), []);
  const { data: tasks, loading: tasksLoading, refetch } = useSupabaseQuery(() => getHousekeepingTasks(), []);

  if (statsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading maintenance dashboard...</p>
        </div>
      </div>
    );
  }

  const s = stats || { maintenanceRooms: 0, totalRooms: 0, dirtyRooms: 0, openComplaints: 0, roomStatusData: [] };
  const allTasks = tasks || [];

  const maintenanceTasks = allTasks.filter((t) => t.type === "MAINTENANCE");
  const pendingMaintenance = maintenanceTasks.filter((t) => t.status === "PENDING");
  const inProgressMaintenance = maintenanceTasks.filter((t) => t.status === "IN_PROGRESS");
  const completedMaintenance = maintenanceTasks.filter((t) => t.status === "COMPLETED");

  const urgentTasks = maintenanceTasks.filter((t) => t.priority === "URGENT" && t.status !== "COMPLETED");

  const handleAdvance = async (id: string, next: "IN_PROGRESS" | "COMPLETED") => {
    await updateHousekeepingStatus(id, next);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{greeting}</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Maintenance overview &mdash; repairs, equipment, and facility upkeep</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/housekeeping">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <Wrench className="h-3.5 w-3.5" />All Tasks
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Rooms Under Maintenance" value={s.maintenanceRooms} subtitle={`of ${s.totalRooms} rooms`} icon={Wrench} iconClassName="bg-red-500/10 text-red-600" />
        <StatCard title="Pending Requests" value={pendingMaintenance.length} subtitle="Awaiting action" icon={Clock} iconClassName="bg-amber-500/10 text-amber-600" />
        <StatCard title="In Progress" value={inProgressMaintenance.length} subtitle="Being worked on" icon={Settings} iconClassName="bg-blue-500/10 text-blue-600" />
        <StatCard title="Completed" value={completedMaintenance.length} subtitle="Total resolved" icon={CheckCircle} iconClassName="bg-teal-500/10 text-teal-500" />
      </div>

      {urgentTasks.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200/60 text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p className="text-sm"><span className="font-semibold">{urgentTasks.length} urgent maintenance request{urgentTasks.length > 1 ? "s" : ""}</span> &mdash; requires immediate attention</p>
        </div>
      )}

      {s.openComplaints > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p className="text-sm"><span className="font-semibold">{s.openComplaints} open complaint{s.openComplaints > 1 ? "s" : ""}</span> may need maintenance follow-up</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Maintenance Tasks */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />Pending Maintenance ({pendingMaintenance.length})
          </h3>
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
            {pendingMaintenance.slice(0, 8).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-semibold text-sm">{task.room?.number ?? "—"}</span>
                    <Badge className={cn("text-[10px] border", PRIORITY_COLORS[task.priority])}>{task.priority}</Badge>
                  </div>
                  {task.notes && <p className="text-[11px] text-muted-foreground line-clamp-1">{task.notes}</p>}
                </div>
                <Button variant="outline" size="sm" className="text-xs h-7 gap-1 shrink-0" onClick={() => handleAdvance(task.id, "IN_PROGRESS")}>
                  <ArrowRight className="h-3 w-3" />Start
                </Button>
              </div>
            ))}
            {pendingMaintenance.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No pending maintenance</p>}
          </div>
        </div>

        {/* In Progress */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />In Progress ({inProgressMaintenance.length})
          </h3>
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
            {inProgressMaintenance.slice(0, 8).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-semibold text-sm">{task.room?.number ?? "—"}</span>
                    {task.assignee?.full_name && (
                      <span className="text-[11px] text-muted-foreground">&middot; {task.assignee.full_name}</span>
                    )}
                  </div>
                  {task.notes && <p className="text-[11px] text-muted-foreground line-clamp-1">{task.notes}</p>}
                </div>
                <Button variant="outline" size="sm" className="text-xs h-7 gap-1 shrink-0 text-teal-500 border-teal-500/20 hover:bg-teal-500/10" onClick={() => handleAdvance(task.id, "COMPLETED")}>
                  <CheckCircle className="h-3 w-3" />Done
                </Button>
              </div>
            ))}
            {inProgressMaintenance.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No tasks in progress</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/dashboard/complaints" className="rounded-xl border border-border/60 bg-card p-4 hover:shadow-md hover:border-border transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Complaints</p>
              <p className="text-xs text-muted-foreground mt-0.5">View complaints that may need maintenance</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>
        <Link href="/dashboard/inventory" className="rounded-xl border border-border/60 bg-card p-4 hover:shadow-md hover:border-border transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Inventory</p>
              <p className="text-xs text-muted-foreground mt-0.5">Check supplies and equipment stock</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
}
