"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { USER_ROLE_LABELS } from "@/lib/constants";
import { getProfiles } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { Loader2 } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";

export default function EmployeesPage() {
  const { data: employees, loading } = useSupabaseQuery(() => getProfiles(), []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  const allEmployees = employees || [];

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
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" description="Manage staff members and roles" action={{ label: "Add Staff" }} />
      <DataTable columns={columns} data={allEmployees} keyExtractor={(e) => e.id} total={allEmployees.length} emptyMessage="No employees" />
    </div>
  );
}
