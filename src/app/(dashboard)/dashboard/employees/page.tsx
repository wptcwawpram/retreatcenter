"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { USER_ROLE_LABELS, ASSIGNABLE_ROLES, ROLE_DASHBOARD_ACCESS, ALL_DASHBOARD_PAGES } from "@/lib/constants";
import { getProfiles } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/client";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { Loader2, Edit2, Shield, Phone, Trash2, AlertCircle, UserPlus, Download, X, ChevronDown, ChevronUp, Send, CheckCircle2 } from "lucide-react";
import { downloadCSV } from "@/lib/export-csv";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

function isCustomRole(role: string) {
  return !ROLE_DASHBOARD_ACCESS[role];
}

function getDefaultAccess(role: string): string[] {
  return ROLE_DASHBOARD_ACCESS[role] || ["dashboard"];
}

function PageAccessSelector({ selectedPages, onChange, role }: { selectedPages: string[]; onChange: (pages: string[]) => void; role: string }) {
  const [expanded, setExpanded] = useState(false);
  const isPredefined = !!ROLE_DASHBOARD_ACCESS[role] && role !== "admin" && role !== "super_admin";
  const isAdmin = role === "admin" || role === "super_admin";

  if (isAdmin) return null;

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Page Access ({selectedPages.length} pages)</span>
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {expanded && (
        <div className="grid grid-cols-2 gap-1.5 p-2.5 rounded-lg border border-border bg-muted/30">
          {isPredefined && (
            <p className="col-span-2 text-[10px] text-muted-foreground mb-1">Default for {USER_ROLE_LABELS[role] || role}. Override by changing selections.</p>
          )}
          {ALL_DASHBOARD_PAGES.map((page) => (
            <label key={page.key} className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-muted/50 rounded px-1.5 py-1">
              <input
                type="checkbox"
                checked={selectedPages.includes(page.key)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...selectedPages, page.key]);
                  } else {
                    onChange(selectedPages.filter((p) => p !== page.key));
                  }
                }}
                className="h-3.5 w-3.5 rounded border-border text-sidebar-primary focus:ring-sidebar-primary"
              />
              <span>{page.label}</span>
            </label>
          ))}
          <div className="col-span-2 flex gap-2 mt-1">
            <button type="button" onClick={() => onChange(ALL_DASHBOARD_PAGES.map((p) => p.key))} className="text-[10px] text-sidebar-primary hover:underline">Select all</button>
            <button type="button" onClick={() => onChange(["dashboard"])} className="text-[10px] text-red-400 hover:underline">Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmployeesPage() {
  const { data: employees, loading, refetch } = useSupabaseQuery(() => getProfiles(), []);

  // Add Employee state
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addRole, setAddRole] = useState("receptionist");
  const [customRole, setCustomRole] = useState("");
  const [addAccess, setAddAccess] = useState<string[]>(getDefaultAccess("receptionist"));
  const [adding, setAdding] = useState(false);

  // Edit Employee state
  const [editItem, setEditItem] = useState<Profile | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editCustomRole, setEditCustomRole] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editAccess, setEditAccess] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);

  // Delete state
  const [deleteItem, setDeleteItem] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Resend invite state
  const [resending, setResending] = useState(false);
  const [resendResult, setResendResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleResendInvite = async (empId: string) => {
    setResending(true);
    setResendResult(null);
    try {
      const res = await fetch("/api/employees/resend-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: empId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResendResult({ ok: false, msg: data.error || "Failed to send" });
      } else {
        setResendResult({ ok: true, msg: "Invitation SMS sent" });
      }
    } catch {
      setResendResult({ ok: false, msg: "Network error" });
    } finally {
      setResending(false);
    }
  };

  const openEdit = (emp: Profile) => {
    setEditItem(emp);
    setResendResult(null);
    setEditName(emp.full_name);
    setEditPhone(emp.phone || "");
    const knownRole = ASSIGNABLE_ROLES.find((r) => r.value === emp.role);
    if (knownRole) {
      setEditRole(emp.role);
      setEditCustomRole("");
    } else {
      setEditRole("__custom__");
      setEditCustomRole(emp.role);
    }
    setEditActive(emp.is_active);
    setEditAccess(emp.dashboard_access || getDefaultAccess(emp.role));
  };

  const handleAddEmployee = async () => {
    if (!addName || !addPhone) return;
    const finalRole = addRole === "__custom__" ? customRole.trim().toLowerCase() : addRole;
    if (!finalRole) return;
    setAdding(true);
    try {
      const accessToSend = addRole === "__custom__" || JSON.stringify(addAccess) !== JSON.stringify(getDefaultAccess(finalRole))
        ? addAccess : null;
      const res = await fetch("/api/employees/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: addName, phone: addPhone, role: finalRole, dashboard_access: accessToSend }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to add employee"); return; }
      if (data.smsError) {
        alert(`Employee added, but SMS invite failed: ${data.smsError}\n\nYou can resend from the edit dialog.`);
      }
      setShowAdd(false);
      setAddName(""); setAddPhone(""); setAddRole("receptionist"); setCustomRole(""); setAddAccess(getDefaultAccess("receptionist"));
      refetch();
    } catch { alert("Failed to add employee"); }
    finally { setAdding(false); }
  };

  const handleEditEmployee = async () => {
    if (!editItem || !editName) return;
    const finalRole = editRole === "__custom__" ? editCustomRole.trim().toLowerCase() : editRole;
    if (!finalRole) return;
    setEditing(true);
    try {
      const supabase = createClient();
      const accessToSave = finalRole === "admin" || finalRole === "super_admin"
        ? null
        : JSON.stringify(editAccess) !== JSON.stringify(getDefaultAccess(finalRole))
          ? editAccess
          : null;
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editName,
          phone: editPhone || null,
          role: finalRole,
          is_active: editActive,
          dashboard_access: accessToSave,
        })
        .eq("id", editItem.id);
      if (error) { alert(error.message); return; }
      setEditItem(null);
      refetch();
    } catch { alert("Failed to update employee"); }
    finally { setEditing(false); }
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
      setEditItem(null);
      refetch();
    } finally { setDeleting(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const allEmployees = employees || [];
  const activeCount = allEmployees.filter((e) => e.is_active).length;

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
    ) : <span className="text-muted-foreground text-xs">---</span>
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
        <Button variant="ghost" size="icon-xs" onClick={(e2) => { e2.stopPropagation(); openEdit(e); }}>
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

  const effectiveAddRole = addRole === "__custom__" ? customRole.trim().toLowerCase() : addRole;
  const effectiveEditRole = editRole === "__custom__" ? editCustomRole.trim().toLowerCase() : editRole;

  return (
    <div className="space-y-5">
      <PageHeader title="Employees" description="Manage staff members and roles" action={{ label: "Add Employee", onClick: () => setShowAdd(true) }}>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
          downloadCSV("employees", ["Name", "Role", "Email", "Phone", "Status"], allEmployees.map((e) => [
            e.full_name,
            USER_ROLE_LABELS[e.role] ?? e.role,
            e.email,
            e.phone ?? "",
            e.is_active ? "Active" : "Inactive",
          ]));
        }}>
          <Download className="h-3.5 w-3.5" />Export CSV
        </Button>
      </PageHeader>

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

      {/* Add Employee Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative z-10 w-full max-w-[calc(100%-2rem)] sm:max-w-md rounded-xl bg-popover p-5 text-sm text-popover-foreground ring-1 ring-foreground/10 shadow-xl animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-base font-semibold flex items-center gap-2"><UserPlus className="h-4 w-4" />Add Employee</h2>
              <button onClick={() => setShowAdd(false)} className="rounded-md p-1 hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
            </div>
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
                <select value={addRole} onChange={(e) => {
                  setAddRole(e.target.value);
                  if (e.target.value !== "__custom__") {
                    setAddAccess(getDefaultAccess(e.target.value));
                  } else {
                    setAddAccess(["dashboard"]);
                  }
                }} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {ASSIGNABLE_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  <option value="__custom__">Custom role...</option>
                </select>
              </div>
              {addRole === "__custom__" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Custom Role Name</Label>
                  <Input value={customRole} onChange={(e) => setCustomRole(e.target.value)} placeholder="e.g. security, driver, cook" className="h-9" />
                </div>
              )}
              <PageAccessSelector selectedPages={addAccess} onChange={setAddAccess} role={effectiveAddRole} />
              <p className="text-[11px] text-muted-foreground">An SMS invitation will be sent to the employee.</p>
            </div>
            <div className="-mx-5 -mb-5 mt-4 flex gap-2 justify-end rounded-b-xl border-t bg-muted/50 p-4">
              <Button variant="outline" onClick={() => setShowAdd(false)} disabled={adding}>Cancel</Button>
              <Button onClick={handleAddEmployee} disabled={adding || !addName || !addPhone || (addRole === "__custom__" && !customRole.trim())}>
                {adding ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Adding...</> : "Add Employee"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) setEditItem(null); }}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative z-10 w-full max-w-[calc(100%-2rem)] sm:max-w-md rounded-xl bg-popover p-5 text-sm text-popover-foreground ring-1 ring-foreground/10 shadow-xl animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-base font-semibold flex items-center gap-2"><Edit2 className="h-4 w-4" />Edit {editItem.full_name}</h2>
              <button onClick={() => setEditItem(null)} className="rounded-md p-1 hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Full Name <span className="text-red-500">*</span></Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} type="tel" className="h-9" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 items-start">
                <div className="space-y-1.5">
                  <Label className="text-xs">Role <span className="text-red-500">*</span></Label>
                  <select value={editRole} onChange={(e) => {
                    setEditRole(e.target.value);
                    if (e.target.value !== "__custom__") {
                      setEditAccess(getDefaultAccess(e.target.value));
                    } else {
                      setEditAccess(["dashboard"]);
                    }
                  }} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {ASSIGNABLE_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    <option value="__custom__">Custom role...</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="edit-active" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} className="h-4 w-4 rounded border-border text-sidebar-primary focus:ring-sidebar-primary" />
                  <Label htmlFor="edit-active" className="cursor-pointer text-xs">Active</Label>
                </div>
              </div>
              {editRole === "__custom__" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Custom Role Name</Label>
                  <Input value={editCustomRole} onChange={(e) => setEditCustomRole(e.target.value)} placeholder="e.g. security, driver, cook" className="h-9" />
                </div>
              )}
              <PageAccessSelector selectedPages={editAccess} onChange={setEditAccess} role={effectiveEditRole} />

              {/* Resend Invite */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleResendInvite(editItem.id)} disabled={resending}>
                  {resending ? <><Loader2 className="h-3 w-3 animate-spin" />Sending...</> : <><Send className="h-3 w-3" />Resend Invite SMS</>}
                </Button>
                {resendResult && (
                  <span className={cn("text-[11px] flex items-center gap-1", resendResult.ok ? "text-teal-500" : "text-red-400")}>
                    {resendResult.ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {resendResult.msg}
                  </span>
                )}
              </div>
            </div>
            <div className="-mx-5 -mb-5 mt-4 flex items-center rounded-b-xl border-t bg-muted/50 p-4">
              {editItem.role !== "super_admin" && (
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-1.5" onClick={() => setDeleteItem(editItem)}>
                  <Trash2 className="h-3.5 w-3.5" />Delete
                </Button>
              )}
              <div className="ml-auto flex gap-2">
                <Button variant="outline" onClick={() => setEditItem(null)} disabled={editing}>Cancel</Button>
                <Button onClick={handleEditEmployee} disabled={editing || !editName || (editRole === "__custom__" && !editCustomRole.trim())}>
                  {editing ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Saving...</> : "Update"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) setDeleteItem(null); }}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative z-10 w-full max-w-[calc(100%-2rem)] sm:max-w-sm rounded-xl bg-popover p-5 text-sm text-popover-foreground ring-1 ring-foreground/10 shadow-xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-base font-semibold">Remove Employee</h2>
              <button onClick={() => setDeleteItem(null)} className="rounded-md p-1 hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex items-start gap-3 text-sm mb-4">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p>Are you sure you want to remove <strong>{deleteItem.full_name}</strong>? This will deactivate their account.</p>
            </div>
            <div className="-mx-5 -mb-5 flex gap-2 justify-end rounded-b-xl border-t bg-muted/50 p-4">
              <Button variant="outline" onClick={() => setDeleteItem(null)} disabled={deleting}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Removing...</> : "Remove"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
