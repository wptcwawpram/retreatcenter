"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Loader2, Save, Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
  Eye, Settings2, Type, Hash, Mail, Phone, Calendar, List, ToggleLeft,
  FileText, CheckCircle, AlertCircle, Copy, Undo2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────

type FieldType = "text" | "email" | "tel" | "number" | "date" | "time" | "select" | "radio" | "checkbox" | "textarea" | "stepper" | "heading" | "divider";

interface FormFieldConfig {
  id: string;
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  helpText?: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  colSpan?: 1 | 2;
  visibleFor?: "all" | "individual" | "group";
  validation?: { pattern?: string; message?: string };
  enabled?: boolean;
}

interface FormSectionConfig {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  visibleFor?: "all" | "individual" | "group";
  collapsible?: boolean;
  fields: FormFieldConfig[];
  enabled?: boolean;
}

interface FormConfig {
  sections: FormSectionConfig[];
  settings: {
    depositPercent: number;
    requireEmail: boolean;
    requirePhone: boolean;
    showPriceSummary: boolean;
    confirmationMessage: string;
  };
}

const FIELD_TYPE_ICONS: Record<FieldType, typeof Type> = {
  text: Type, email: Mail, tel: Phone, number: Hash, date: Calendar, time: Calendar,
  select: List, radio: List, checkbox: ToggleLeft, textarea: FileText,
  stepper: Hash, heading: Type, divider: Type,
};

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Text Input", email: "Email", tel: "Phone", number: "Number", date: "Date",
  time: "Time", select: "Dropdown", radio: "Radio Buttons", checkbox: "Checkbox",
  textarea: "Text Area", stepper: "Number Stepper", heading: "Section Heading",
  divider: "Divider",
};

const ICON_OPTIONS = [
  "User", "Users", "Phone", "Shield", "BedDouble", "Clock",
  "CreditCard", "Church", "UtensilsCrossed", "TreePine", "CalendarCheck",
  "Mail", "MapPin", "Heart", "Star", "Flag",
];

function generateId() {
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Default Config (matches current booking form) ──────────────────

function getDefaultConfig(): FormConfig {
  return {
    sections: [
      {
        id: "sec_type", title: "Booking Type", icon: "Users", visibleFor: "all", enabled: true,
        fields: [
          { id: "f_booking_type", type: "radio", name: "bookingType", label: "Booking Type", required: true, options: [{ label: "Individual", value: "individual" }, { label: "Group", value: "group" }], visibleFor: "all", enabled: true, colSpan: 2 },
        ],
      },
      {
        id: "sec_personal", title: "Personal Information", icon: "User", visibleFor: "all", enabled: true,
        fields: [
          { id: "f_name", type: "text", name: "name", label: "Full Name", placeholder: "Full name", required: true, visibleFor: "all", enabled: true, colSpan: 1 },
          { id: "f_age", type: "select", name: "ageRange", label: "Age Range", visibleFor: "all", enabled: true, colSpan: 1, options: [
            { label: "18-25", value: "18-25" }, { label: "26-30", value: "26-30" }, { label: "31-36", value: "31-36" },
            { label: "36-40", value: "36-40" }, { label: "41-45", value: "41-45" }, { label: "46-50", value: "46-50" },
            { label: "51-55", value: "51-55" }, { label: "56-60", value: "56-60" }, { label: "61-65", value: "61-65" },
            { label: "66-70", value: "66-70" }, { label: "Above 71", value: "Above 71" },
          ]},
          { id: "f_email", type: "email", name: "email", label: "Email", placeholder: "your@email.com", required: true, visibleFor: "all", enabled: true, colSpan: 1 },
          { id: "f_phone", type: "tel", name: "phone", label: "Phone / Mobile", placeholder: "+233 XXX XXX XXX", required: true, visibleFor: "all", enabled: true, colSpan: 1 },
          { id: "f_address", type: "text", name: "address", label: "Address", placeholder: "Your address", visibleFor: "all", enabled: true, colSpan: 2 },
          { id: "f_denomination", type: "text", name: "denomination", label: "Denomination", placeholder: "e.g. Methodist, Catholic", visibleFor: "all", enabled: true, colSpan: 1 },
          { id: "f_relationship", type: "select", name: "relationship", label: "Relationship Status", visibleFor: "individual", enabled: true, colSpan: 1, options: [
            { label: "Married", value: "Married" }, { label: "Single", value: "Single" },
            { label: "In a Relationship", value: "In a Relationship" }, { label: "Divorced", value: "Divorced" },
          ]},
        ],
      },
      {
        id: "sec_contact", title: "Secondary Contact", icon: "Phone", description: "Someone we can reach in case the primary contact is unavailable.", visibleFor: "all", enabled: true,
        fields: [
          { id: "f_alt_name", type: "text", name: "altContactName", label: "Contact Name", placeholder: "Full name", visibleFor: "all", enabled: true, colSpan: 1 },
          { id: "f_alt_rel", type: "text", name: "altContactRelationship", label: "Relationship", placeholder: "e.g. Spouse, Friend", visibleFor: "all", enabled: true, colSpan: 1 },
          { id: "f_alt_phone", type: "tel", name: "altContactPhone", label: "Phone Number", placeholder: "+233 XXX XXX XXX", visibleFor: "all", enabled: true, colSpan: 1 },
        ],
      },
      {
        id: "sec_id", title: "Identification", icon: "Shield", visibleFor: "all", enabled: true,
        fields: [
          { id: "f_id_type", type: "select", name: "idType", label: "ID Card Type", visibleFor: "all", enabled: true, colSpan: 1, options: [
            { label: "Ghana Card", value: "Ghana Card" }, { label: "Passport", value: "Passport" }, { label: "Driver's License", value: "Driver's License" },
          ]},
          { id: "f_id_number", type: "text", name: "idNumber", label: "ID Card Number", placeholder: "Enter your ID number", visibleFor: "all", enabled: true, colSpan: 1 },
        ],
      },
      {
        id: "sec_dates", title: "Stay Duration", icon: "Clock", visibleFor: "all", enabled: true,
        fields: [
          { id: "f_checkin", type: "date", name: "fromDate", label: "Check-in Date", required: true, visibleFor: "all", enabled: true, colSpan: 1 },
          { id: "f_nights", type: "stepper", name: "nights", label: "Number of Nights", min: 1, max: 90, defaultValue: "1", visibleFor: "all", enabled: true, colSpan: 1 },
          { id: "f_checkout", type: "date", name: "toDate", label: "Check-out Date", required: true, visibleFor: "all", enabled: true, colSpan: 1 },
          { id: "f_arrival", type: "time", name: "startTime", label: "Arrival Time", visibleFor: "all", enabled: true, colSpan: 1 },
        ],
      },
      {
        id: "sec_lodging", title: "Lodging Details", icon: "BedDouble", visibleFor: "all", enabled: true,
        description: "Room selection and availability",
        fields: [
          { id: "f_is_lodging", type: "radio", name: "isLodging", label: "Are you lodging?", options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }], visibleFor: "all", enabled: true, colSpan: 2 },
        ],
      },
      {
        id: "sec_hall", title: "Hall Usage", icon: "Church", visibleFor: "group", enabled: true,
        description: "Select one or more halls you need.",
        fields: [],
      },
      {
        id: "sec_kitchen", title: "Kitchen & Dining", icon: "UtensilsCrossed", visibleFor: "group", enabled: true,
        description: "Select one kitchen option based on your group size.",
        fields: [],
      },
      {
        id: "sec_grounds", title: "Grounds Usage", icon: "TreePine", visibleFor: "group", enabled: true,
        fields: [
          { id: "f_wedding", type: "checkbox", name: "needsGrounds", label: "Wedding Grounds", visibleFor: "group", enabled: true, colSpan: 2 },
        ],
      },
      {
        id: "sec_requests", title: "Special Requests", icon: "CalendarCheck", visibleFor: "all", enabled: true,
        fields: [
          { id: "f_requests", type: "textarea", name: "specialRequests", label: "Any special requirements or notes?", placeholder: "Dietary needs, accessibility requirements, event details...", visibleFor: "all", enabled: true, colSpan: 2 },
        ],
      },
    ],
    settings: {
      depositPercent: 30,
      requireEmail: true,
      requirePhone: true,
      showPriceSummary: true,
      confirmationMessage: "Payment received! A confirmation SMS has been sent. Please save your reference number for check-in.",
    },
  };
}

// ─── Field Editor Dialog ────────────────────────────────────────────

function FieldEditor({
  field,
  open,
  onOpenChange,
  onSave,
}: {
  field: FormFieldConfig;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (f: FormFieldConfig) => void;
}) {
  const [draft, setDraft] = useState<FormFieldConfig>(field);
  const [optionText, setOptionText] = useState("");

  useEffect(() => { setDraft(field); }, [field]);

  const update = (key: keyof FormFieldConfig, value: unknown) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const addOption = () => {
    if (!optionText.trim()) return;
    update("options", [...(draft.options || []), { label: optionText.trim(), value: optionText.trim() }]);
    setOptionText("");
  };

  const removeOption = (idx: number) => {
    update("options", (draft.options || []).filter((_, i) => i !== idx));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Field</DialogTitle>
          <DialogDescription>Configure field properties</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Field Name (key)</Label>
              <Input value={draft.name} onChange={(e) => update("name", e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Label</Label>
              <Input value={draft.label} onChange={(e) => update("label", e.target.value)} className="h-8 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <select
                value={draft.type}
                onChange={(e) => update("type", e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-background px-3 text-sm"
              >
                {Object.entries(FIELD_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Column Span</Label>
              <select
                value={draft.colSpan || 1}
                onChange={(e) => update("colSpan", parseInt(e.target.value))}
                className="w-full h-8 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value={1}>Half width</option>
                <option value={2}>Full width</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Placeholder</Label>
            <Input value={draft.placeholder || ""} onChange={(e) => update("placeholder", e.target.value)} className="h-8 text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Help Text</Label>
            <Input value={draft.helpText || ""} onChange={(e) => update("helpText", e.target.value)} className="h-8 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Visible For</Label>
              <select
                value={draft.visibleFor || "all"}
                onChange={(e) => update("visibleFor", e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All</option>
                <option value="individual">Individual Only</option>
                <option value="group">Group Only</option>
              </select>
            </div>
            <div className="flex items-end gap-4 pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={draft.required || false} onCheckedChange={(v) => update("required", v)} />
                <span className="text-xs">Required</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={draft.enabled !== false} onCheckedChange={(v) => update("enabled", v)} />
                <span className="text-xs">Enabled</span>
              </label>
            </div>
          </div>

          {(draft.type === "number" || draft.type === "stepper") && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Min</Label>
                <Input type="number" value={draft.min ?? ""} onChange={(e) => update("min", e.target.value ? Number(e.target.value) : undefined)} className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Max</Label>
                <Input type="number" value={draft.max ?? ""} onChange={(e) => update("max", e.target.value ? Number(e.target.value) : undefined)} className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Default</Label>
                <Input value={draft.defaultValue || ""} onChange={(e) => update("defaultValue", e.target.value)} className="h-8 text-sm" />
              </div>
            </div>
          )}

          {(draft.type === "select" || draft.type === "radio") && (
            <div className="space-y-2">
              <Label className="text-xs">Options</Label>
              <div className="space-y-1">
                {(draft.options || []).map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex-1 text-xs bg-muted/30 px-2.5 py-1.5 rounded border border-border/60">{opt.label}</span>
                    <Button variant="ghost" size="icon-xs" className="text-red-500" onClick={() => removeOption(i)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add option..."
                  value={optionText}
                  onChange={(e) => setOptionText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOption())}
                  className="h-8 text-sm"
                />
                <Button size="sm" variant="outline" onClick={addOption} className="h-8">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onSave(draft); onOpenChange(false); }}>Save Field</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Section Editor ─────────────────────────────────────────────────

function SectionEditor({
  section,
  sectionIndex,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  section: FormSectionConfig;
  sectionIndex: number;
  onUpdate: (s: FormSectionConfig) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [editField, setEditField] = useState<FormFieldConfig | null>(null);

  const addField = () => {
    const newField: FormFieldConfig = {
      id: generateId(),
      type: "text",
      name: `field_${Date.now()}`,
      label: "New Field",
      visibleFor: "all",
      enabled: true,
      colSpan: 1,
    };
    onUpdate({ ...section, fields: [...section.fields, newField] });
  };

  const updateField = (idx: number, field: FormFieldConfig) => {
    const fields = [...section.fields];
    fields[idx] = field;
    onUpdate({ ...section, fields });
  };

  const removeField = (idx: number) => {
    onUpdate({ ...section, fields: section.fields.filter((_, i) => i !== idx) });
  };

  const moveField = (idx: number, dir: -1 | 1) => {
    const fields = [...section.fields];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= fields.length) return;
    [fields[idx], fields[newIdx]] = [fields[newIdx], fields[idx]];
    onUpdate({ ...section, fields });
  };

  const duplicateField = (idx: number) => {
    const original = section.fields[idx];
    const copy = { ...original, id: generateId(), name: original.name + "_copy", label: original.label + " (Copy)" };
    const fields = [...section.fields];
    fields.splice(idx + 1, 0, copy);
    onUpdate({ ...section, fields });
  };

  return (
    <div className={cn(
      "rounded-xl border bg-card transition-all",
      section.enabled === false ? "opacity-50 border-border/40" : "border-border/60"
    )}>
      {/* Section header */}
      <div className="flex items-center gap-2 p-3 border-b border-border/40">
        <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground">
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>

        <Input
          value={section.title}
          onChange={(e) => onUpdate({ ...section, title: e.target.value })}
          className="h-7 text-sm font-semibold flex-1 border-none bg-transparent px-1"
        />

        <select
          value={section.icon || ""}
          onChange={(e) => onUpdate({ ...section, icon: e.target.value })}
          className="h-7 rounded border border-input bg-background px-1.5 text-[10px] w-24"
        >
          <option value="">No icon</option>
          {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>

        <select
          value={section.visibleFor || "all"}
          onChange={(e) => onUpdate({ ...section, visibleFor: e.target.value as FormSectionConfig["visibleFor"] })}
          className="h-7 rounded border border-input bg-background px-1.5 text-[10px] w-20"
        >
          <option value="all">All</option>
          <option value="individual">Individual</option>
          <option value="group">Group</option>
        </select>

        <label className="flex items-center gap-1 cursor-pointer">
          <Switch checked={section.enabled !== false} onCheckedChange={(v) => onUpdate({ ...section, enabled: v })} />
        </label>

        <div className="flex items-center gap-0.5 border-l border-border/40 pl-1.5 ml-1">
          <Button variant="ghost" size="icon-xs" onClick={onMoveUp} disabled={isFirst}><ChevronUp className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon-xs" onClick={onMoveDown} disabled={isLast}><ChevronDown className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon-xs" className="text-red-500" onClick={onRemove}><Trash2 className="h-3 w-3" /></Button>
        </div>
      </div>

      {/* Section description */}
      {!collapsed && (
        <div className="px-3 pt-2">
          <Input
            value={section.description || ""}
            onChange={(e) => onUpdate({ ...section, description: e.target.value })}
            placeholder="Section description (optional)"
            className="h-7 text-xs border-dashed"
          />
        </div>
      )}

      {/* Fields */}
      {!collapsed && (
        <div className="p-3 space-y-1.5">
          {section.fields.map((field, fi) => {
            const Icon = FIELD_TYPE_ICONS[field.type] || Type;
            return (
              <div
                key={field.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border transition-all group",
                  field.enabled === false
                    ? "border-border/30 bg-muted/10 opacity-50"
                    : "border-border/50 bg-muted/20 hover:bg-muted/30"
                )}
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />

                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium truncate">{field.label}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">{FIELD_TYPE_LABELS[field.type]}</span>
                  {field.required && <span className="text-red-400 text-[10px] ml-1">*</span>}
                  {field.visibleFor !== "all" && (
                    <span className="text-[9px] text-primary ml-1.5 px-1 py-0.5 bg-primary/10 rounded">{field.visibleFor}</span>
                  )}
                  {field.colSpan === 2 && (
                    <span className="text-[9px] text-muted-foreground ml-1 px-1 py-0.5 bg-muted/40 rounded">full width</span>
                  )}
                </div>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon-xs" onClick={() => moveField(fi, -1)} disabled={fi === 0}>
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => moveField(fi, 1)} disabled={fi === section.fields.length - 1}>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => duplicateField(fi)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => setEditField(field)}>
                    <Settings2 className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon-xs" className="text-red-500" onClick={() => removeField(fi)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}

          <Button variant="outline" size="sm" onClick={addField} className="w-full h-8 text-xs border-dashed mt-2">
            <Plus className="h-3 w-3 mr-1.5" /> Add Field
          </Button>
        </div>
      )}

      {editField && (
        <FieldEditor
          field={editField}
          open={!!editField}
          onOpenChange={(o) => !o && setEditField(null)}
          onSave={(f) => {
            const idx = section.fields.findIndex((x) => x.id === f.id);
            if (idx >= 0) updateField(idx, f);
          }}
        />
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────

export default function FormBuilderPage() {
  const [config, setConfig] = useState<FormConfig>(getDefaultConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<"sections" | "settings">("sections");

  useEffect(() => {
    fetch("/api/form-config?type=booking")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          setConfig(data.config);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_type: "booking", config, name: "Booking Form" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save failed");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset to default form layout? This will undo all changes since last save.")) {
      setConfig(getDefaultConfig());
    }
  };

  const updateSection = (idx: number, section: FormSectionConfig) => {
    const sections = [...config.sections];
    sections[idx] = section;
    setConfig({ ...config, sections });
  };

  const removeSection = (idx: number) => {
    setConfig({ ...config, sections: config.sections.filter((_, i) => i !== idx) });
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    const sections = [...config.sections];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= sections.length) return;
    [sections[idx], sections[newIdx]] = [sections[newIdx], sections[idx]];
    setConfig({ ...config, sections });
  };

  const addSection = () => {
    setConfig({
      ...config,
      sections: [
        ...config.sections,
        {
          id: generateId(),
          title: "New Section",
          icon: "",
          visibleFor: "all",
          enabled: true,
          fields: [],
        },
      ],
    });
  };

  const updateSetting = <K extends keyof FormConfig["settings"]>(key: K, value: FormConfig["settings"][K]) => {
    setConfig({ ...config, settings: { ...config.settings, [key]: value } });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Form Builder"
        description="Customize the booking form — add, remove, or reorder fields and sections"
        action={{ label: saved ? "Saved!" : saving ? "Saving..." : "Save Changes", onClick: handleSave }}
      />

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="flex border border-border/60 rounded-lg overflow-hidden">
          {(["sections", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 text-xs font-medium transition-all capitalize",
                activeTab === tab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <Button variant="outline" size="sm" onClick={handleReset} className="h-8 text-xs gap-1.5">
          <Undo2 className="h-3 w-3" /> Reset to Default
        </Button>

        <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} className="h-8 text-xs gap-1.5">
          <Eye className="h-3 w-3" /> Preview
        </Button>

        <Button size="sm" onClick={addSection} className="h-8 text-xs gap-1.5">
          <Plus className="h-3 w-3" /> Add Section
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* Sections Tab */}
      {activeTab === "sections" && (
        <div className="space-y-3">
          {config.sections.map((section, si) => (
            <SectionEditor
              key={section.id}
              section={section}
              sectionIndex={si}
              onUpdate={(s) => updateSection(si, s)}
              onRemove={() => removeSection(si)}
              onMoveUp={() => moveSection(si, -1)}
              onMoveDown={() => moveSection(si, 1)}
              isFirst={si === 0}
              isLast={si === config.sections.length - 1}
            />
          ))}

          {config.sections.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border/60 rounded-xl">
              No sections yet. Click &ldquo;Add Section&rdquo; to get started.
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="rounded-xl border border-border/60 bg-card p-6 space-y-6">
          <h3 className="font-semibold text-sm mb-4">Form Settings</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs">Deposit Percentage (%)</Label>
              <Input
                type="number"
                value={config.settings.depositPercent}
                onChange={(e) => updateSetting("depositPercent", Number(e.target.value) || 30)}
                min={0}
                max={100}
                className="h-9"
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-xs">Require Email</span>
                <Switch checked={config.settings.requireEmail} onCheckedChange={(v) => updateSetting("requireEmail", v)} />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-xs">Require Phone</span>
                <Switch checked={config.settings.requirePhone} onCheckedChange={(v) => updateSetting("requirePhone", v)} />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-xs">Show Price Summary</span>
                <Switch checked={config.settings.showPriceSummary} onCheckedChange={(v) => updateSetting("showPriceSummary", v)} />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Confirmation Message</Label>
            <textarea
              value={config.settings.confirmationMessage}
              onChange={(e) => updateSetting("confirmationMessage", e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            />
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Preview</DialogTitle>
            <DialogDescription>This is how the form will look to guests</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {config.sections
              .filter((s) => s.enabled !== false)
              .map((section) => (
                <div key={section.id} className="rounded-lg border border-border/60 p-4">
                  <h3 className="font-semibold text-sm mb-1">{section.title}</h3>
                  {section.description && <p className="text-xs text-muted-foreground mb-3">{section.description}</p>}
                  {section.visibleFor !== "all" && (
                    <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded mb-3 inline-block">{section.visibleFor} only</span>
                  )}
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {section.fields
                      .filter((f) => f.enabled !== false)
                      .map((field) => (
                        <div key={field.id} className={cn("space-y-1", field.colSpan === 2 ? "col-span-2" : "col-span-1")}>
                          <Label className="text-xs">
                            {field.label} {field.required && <span className="text-red-400">*</span>}
                          </Label>
                          {field.type === "textarea" ? (
                            <textarea className="w-full rounded-md border border-input bg-muted/20 px-3 py-1.5 text-sm h-16" placeholder={field.placeholder} disabled />
                          ) : field.type === "select" ? (
                            <select className="w-full h-8 rounded-md border border-input bg-muted/20 px-3 text-sm" disabled>
                              <option>{field.placeholder || `Select ${field.label}`}</option>
                              {field.options?.map((o) => <option key={o.value}>{o.label}</option>)}
                            </select>
                          ) : field.type === "radio" ? (
                            <div className="flex gap-3">
                              {field.options?.map((o) => (
                                <label key={o.value} className="flex items-center gap-1.5 text-xs">
                                  <input type="radio" disabled /> {o.label}
                                </label>
                              ))}
                            </div>
                          ) : field.type === "checkbox" ? (
                            <label className="flex items-center gap-2 text-xs">
                              <input type="checkbox" disabled /> {field.label}
                            </label>
                          ) : field.type === "heading" ? (
                            <h4 className="text-sm font-semibold">{field.label}</h4>
                          ) : field.type === "divider" ? (
                            <hr className="border-border/40" />
                          ) : (
                            <Input type={field.type} placeholder={field.placeholder} className="h-8 text-sm bg-muted/20" disabled />
                          )}
                          {field.helpText && <p className="text-[10px] text-muted-foreground">{field.helpText}</p>}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
