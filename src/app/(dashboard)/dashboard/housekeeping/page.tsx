"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHousekeepingTasks } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { BedDouble, Clock, User, CheckCircle, Loader2 } from "lucide-react";
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
  const { data: tasks, loading } = useSupabaseQuery(() => getHousekeepingTasks(), []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  const allTasks = tasks || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Housekeeping" description="Manage room cleaning tasks and assignments" action={{ label: "New Task" }} />

      {/* Kanban Board */}
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
                  return (
                    <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <BedDouble className="h-4 w-4 text-muted-foreground" />
                            <span className="font-bold">{task.room?.number ?? "—"}</span>
                          </div>
                          <Badge className={cn("text-xs border", pri.color)}>{pri.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{task.room?.name ?? ""}</p>
                        <p className="text-sm mb-3">{task.notes}</p>
                        {task.assignee?.full_name ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {task.assignee.full_name}
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" className="w-full text-xs h-7">
                            Assign Staff
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {colTasks.length === 0 && (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground text-sm">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
