"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { USER_ROLE_LABELS } from "@/lib/constants";
import { DEMO_EMPLOYEES } from "@/lib/demo-data";

type Employee = (typeof DEMO_EMPLOYEES)[number];

export default function EmployeesPage() {
  const columns: Column<Employee>[] = [
    { header: "Name", accessor: (e) => <span className="font-medium">{e.name}</span> },
    { header: "Role", accessor: (e) => <Badge variant="outline">{USER_ROLE_LABELS[e.role] ?? e.role}</Badge> },
    { header: "Phone", accessor: "phone" },
    { header: "Email", accessor: (e) => <span className="text-xs">{e.email}</span> },
    { header: "Status", accessor: (e) => (
      <Badge className={e.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-700 border-gray-300"}>
        {e.status}
      </Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" description="Manage staff members and roles" action={{ label: "Add Staff" }} />
      <DataTable columns={columns} data={DEMO_EMPLOYEES} keyExtractor={(e) => e.id} total={DEMO_EMPLOYEES.length} emptyMessage="No employees" />
    </div>
  );
}
