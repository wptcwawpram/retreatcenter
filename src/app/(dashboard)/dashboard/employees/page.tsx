"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { USER_ROLE_LABELS } from "@/lib/constants";
import { getProfiles } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/client";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { Loader2, Edit2, Shield, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/supabase/types";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-50 text-purple-700 border-purple-200",
  manager: "bg-blue-50 text-blue-700 border-blue-200",
  receptionist: "bg-amber-50 text-amber-700 border-amber-200",
  housekeeping: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const editFields: FormField[] = [
  { name: "full_name", label: "Full Name", required: true },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "role", label: "Role", type: "select", required: true, options: Object.entries(USER_ROLE_LABELS).map(([k, v]) => ({ label: v, value: k.toLowerCase() })) },
  { name: "is_active", label: "Active", type: "checkbox" },
];

export default function EmployeesPage() {
  const { data: employees, loading, refetch } = useSupabaseQuery(() => getProfiles(), []);
  const [editItem, setEditItem] = useState<Profile | null>(null);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const allEmployees = employees || [];
  const activeCount = allEmployees.filter((e) => e.is_active).length;

  const handleEdit = async (values: Record<string, unknown>) => {
    if (!editItem) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.full_name as string,
        phone: (values.phone as string) || null,
        role: values.role as Profile["role"],
        is_active: !!values.is_active,
      })
      .eq("id", editItem.id);
    if (error) throw error;
    setEditItem(null);
    refetch();
  };

  const columns: Column<Profile>[] = [
    { header: "Staff", accessor: (e) => (
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/8 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
          {e.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-sm">{e.full_name}</p>
          <p className="text-[11px] text-muted-foreground">{e.email}</p>
        </div>
      </div>
    )},
    { header: "Role", accessor: (e) => (
      <Badge className={cn("text-[11px] border font-medium", ROLE_COLORS[e.role] ?? "bg-gray-50 text-gray-700 border-gray-200")}>
        <Shield className="h-3 w-3 mr-1" />
        {USER_ROLE_LABELS[e.role] ?? e.role}
      </Badge>
    )},
    { header: "Phone", accessor: (e) => e.phone ? (
      <div className="flex items-center gap-1.5 text-xs">
        <Phone className="h-3 w-3 text-muted-foreground" />
        {e.phone}
      </div>
    ) : <span className="text-muted-foreground text-xs">—</span>
    },
    { header: "Status", accessor: (e) => (
      <div className="flex items-center gap-1.5">
        <span className={cn("h-2 w-2 rounded-full", e.is_active ? "bg-emerald-400" : "bg-gray-300")} />
        <span className={cn("text-xs font-medium", e.is_active ? "text-emerald-700" : "text-muted-foreground")}>
          {e.is_active ? "Active" : "Inactive"}
        </span>
      </div>
    )},
    { header: "", accessor: (e) => (
      <Button variant="ghost" size="icon-xs" onClick={(e2) => { e2.stopPropagation(); setEditItem(e); }}>
        <Edit2 className="h-3.5 w-3.5" />
      </Button>
    )},
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Employees" description="Manage staff members and roles" />

      {/* Summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span><strong className="text-foreground">{allEmployees.length}</strong> total staff</span>
        <span className="h-1 w-1 rounded-full bg-border" />
        <span><strong className="text-emerald-600">{activeCount}</strong> active</span>
        {allEmployees.length - activeCount > 0 && (
          <>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span><strong className="text-muted-foreground">{allEmployees.length - activeCount}</strong> inactive</span>
          </>
        )}
      </div>

      <DataTable columns={columns} data={allEmployees} keyExtractor={(e) => e.id} total={allEmployees.length} emptyMessage="No employees" />

      {editItem && (
        <FormDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} title={`Edit ${editItem.full_name}`} fields={editFields} initialValues={editItem} onSubmit={handleEdit} isEdit />
      )}
    </div>
  );
}
