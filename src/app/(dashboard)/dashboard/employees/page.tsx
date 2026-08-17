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
import { Loader2, Edit2, Shield, Phone, Trash2, AlertCircle, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/supabase/types";

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  admin: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  manager: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  receptionist: "bg-sidebar-primary/5 text-sidebar-primary border-sidebar-primary/20",
  housekeeping: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  accountant: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  maintenance: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

const ASSIGNABLE_ROLES = Object.entries(USER_ROLE_LABELS)
  .filter(([k]) => k !== "SUPER_ADMIN" && k !== "GUEST")
  .map(([k, v]) => ({ label: v, value: k.toLowerCase() }));

const editFields: FormField[] = [
  { name: "full_name", label: "Full Name", required: true },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "role", label: "Role", type: "select", required: true, options: ASSIGNABLE_ROLES },
  { name: "is_active", label: "Active", type: "checkbox" },
];

export default function EmployeesPage() {
  const { data: employees, loading, refetch } = useSupabaseQuery(() => getProfiles(), []);
  const [editItem, setEditItem] = useState<Profile | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addRole, setAddRole] = useState("receptionist");
  const [adding, setAdding] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAddEmployee = async () => {
    if (!addName || !addPhone) return;
    setAdding(true);
    try {
      const res = await fetch("/api/employees/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: addName, phone: addPhone, role: addRole }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to add employee"); return; }
      setShowAdd(false);
      setAddName(""); setAddPhone(""); setAddRole("receptionist");
      refetch();
    } catch { alert("Failed to add employee"); }
    finally { setAdding(false); }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "profiles", id: deleteItem.id }),
      });
      if (!res.ok) { alert("Failed to delete employee"); return; }
      setDeleteItem(null);
      refetch();
    } finally { setDeleting(false); }
  };

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
      <Badge className={cn("text-[11px] border font-medium", ROLE_COLORS[e.role] ?? "bg-muted/30 text-muted-foreground border-border")}>
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
        <span className={cn("h-2 w-2 rounded-full", e.is_active ? "bg-teal-400" : "bg-gray-300")} />
        <span className={cn("text-xs font-medium", e.is_active ? "text-teal-400" : "text-muted-foreground")}>
          {e.is_active ? "Active" : "Inactive"}
        </span>
      </div>
    )},
    { header: "", accessor: (e) => (
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon-xs" onClick={(e2) => { e2.stopPropagation(); setEditItem(e); }}>
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        {e.role !== "super_admin" && (
          <Button variant="ghost" size="icon-xs" onClick={(e2) => { e2.stopPropagation(); setDeleteItem(e); }} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Employees" description="Manage staff members and roles" action={{ label: "Add Employee", onClick: () => setShowAdd(true) }} />

      {/* Summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span><strong className="text-foreground">{allEmployees.length}</strong> total staff</span>
        <span className="h-1 w-1 rounded-full bg-border" />
        <span><strong className="text-teal-500">{activeCount}</strong> active</span>
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

      {/* Add Employee Dialog */}
      <Dialog open={showAdd} onOpenChange={(o) => { if (!o) setShowAdd(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><UserPlus className="h-4 w-4" />Add Employee</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g. Kwame Asante" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone Number</Label>
              <Input value={addPhone} onChange={(e) => setAddPhone(e.target.value)} placeholder="e.g. 024 725 8161" type="tel" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={addRole} onValueChange={(v) => v && setAddRole(v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <p className="text-[11px] text-muted-foreground">An SMS will be sent to the employee. They log in with their phone number and set up a password.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)} disabled={adding}>Cancel</Button>
            <Button onClick={handleAddEmployee} disabled={adding || !addName || !addPhone}>
              {adding ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Adding...</> : "Add Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Remove Employee</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p>Are you sure you want to remove <strong>{deleteItem?.full_name}</strong>? This will deactivate their account.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Removing...</> : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
