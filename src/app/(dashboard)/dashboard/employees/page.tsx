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
import { Loader2, Edit2 } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";

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
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  const allEmployees = employees || [];

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
    { header: "Name", accessor: (e) => <span className="font-medium">{e.full_name}</span> },
    { header: "Role", accessor: (e) => <Badge variant="outline">{USER_ROLE_LABELS[e.role] ?? e.role}</Badge> },
    { header: "Phone", accessor: (e) => e.phone ?? "—" },
    { header: "Email", accessor: (e) => <span className="text-xs">{e.email}</span> },
    { header: "Status", accessor: (e) => (
      <Badge className={e.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-700 border-gray-300"}>
        {e.is_active ? "Active" : "Inactive"}
      </Badge>
    )},
    { header: "", accessor: (e) => (
      <Button variant="ghost" size="icon-sm" onClick={(e2) => { e2.stopPropagation(); setEditItem(e); }}><Edit2 className="h-3.5 w-3.5" /></Button>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" description="Manage staff members and roles" />
      <DataTable columns={columns} data={allEmployees} keyExtractor={(e) => e.id} total={allEmployees.length} emptyMessage="No employees" />

      {editItem && (
        <FormDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} title={`Edit ${editItem.full_name}`} fields={editFields} initialValues={editItem} onSubmit={handleEdit} isEdit />
      )}
    </div>
  );
}
