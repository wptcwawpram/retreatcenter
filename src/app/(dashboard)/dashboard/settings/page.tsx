"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, Loader2, CheckCircle, Building2, Tag, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsMap = Record<string, string>;

const DEFAULTS: SettingsMap = {
  property_name: "Warriors Prayer Tower Complex",
  short_name: "WPTC",
  phone: "+233 546 802 414",
  email: "wptc.wawpram@gmail.com",
  address: "Warriors Prayer Tower Complex (Daniels' Christian Retreat Centre), Atwima Boko – Kumasi, Ghana",
  auto_housekeeping: "true",
  booking_sms: "true",
  require_deposit: "true",
  price_2in1: "150",
  price_4in1: "200",
  price_6in1: "270",
  price_suite_fan: "350",
  price_suite_ac: "750",
  price_apartment: "750",
  notif_new_booking: "true",
  notif_payment: "true",
  notif_checkin_reminder: "true",
  notif_low_inventory: "true",
  notif_complaint: "true",
  admin_notif_phone: "",
  admin_notif_email: "",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "pricing" | "notifications">("general");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => { if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings })); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (key: string, value: string) => setSettings((prev) => ({ ...prev, [key]: value }));
  const toggleSwitch = (key: string) => setSettings((prev) => ({ ...prev, [key]: prev[key] === "true" ? "false" : "true" }));

  const saveSection = async (section: string, keys: string[]) => {
    setSaving(section);
    setSaved(null);
    try {
      const sectionSettings: SettingsMap = {};
      keys.forEach((k) => { sectionSettings[k] = settings[k]; });
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: sectionSettings }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(section);
      setTimeout(() => setSaved(null), 3000);
    } catch { alert("Failed to save settings. Please try again."); }
    finally { setSaving(null); }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <PageHeader title="Settings" description="System configuration and preferences" />
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  const tabs = [
    { key: "general" as const, label: "General", icon: Building2 },
    { key: "pricing" as const, label: "Pricing", icon: Tag },
    { key: "notifications" as const, label: "Notifications", icon: Bell },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="System configuration and preferences" />

      {/* Tab bar */}
      <div className="flex gap-1.5 border-b border-border/60 pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px",
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* General */}
      {activeTab === "general" && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-5">
            <h3 className="text-sm font-semibold">Property Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Property Name</Label>
                <Input value={settings.property_name} onChange={(e) => update("property_name", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Short Name</Label>
                <Input value={settings.short_name} onChange={(e) => update("short_name", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone</Label>
                <Input value={settings.phone} onChange={(e) => update("phone", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input value={settings.email} onChange={(e) => update("email", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs">Address</Label>
                <Input value={settings.address} onChange={(e) => update("address", e.target.value)} className="h-9" />
              </div>
            </div>
            <SaveButton section="general" saving={saving} saved={saved} onClick={() => saveSection("general", ["property_name", "short_name", "phone", "email", "address"])} />
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold">System Preferences</h3>
            <div className="space-y-4">
              <SwitchRow label="Auto-assign housekeeping" desc="Automatically create cleaning tasks after check-out" checked={settings.auto_housekeeping === "true"} onToggle={() => toggleSwitch("auto_housekeeping")} />
              <SwitchRow label="Booking confirmation SMS" desc="Send SMS when a booking is confirmed" checked={settings.booking_sms === "true"} onToggle={() => toggleSwitch("booking_sms")} />
              <SwitchRow label="Require deposit" desc="Require 30% deposit for all bookings" checked={settings.require_deposit === "true"} onToggle={() => toggleSwitch("require_deposit")} />
            </div>
            <SaveButton section="preferences" saving={saving} saved={saved} onClick={() => saveSection("preferences", ["auto_housekeeping", "booking_sms", "require_deposit"])} />
          </div>
        </div>
      )}

      {/* Pricing */}
      {activeTab === "pricing" && (
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-5">
          <h3 className="text-sm font-semibold">Room Pricing (per night)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: "price_2in1", label: "2 in 1 Room" },
              { key: "price_4in1", label: "4 in 1 Room" },
              { key: "price_6in1", label: "6 in 1 Room" },
              { key: "price_suite_fan", label: "Suite (Fan)" },
              { key: "price_suite_ac", label: "Suite (AC)" },
              { key: "price_apartment", label: "Holy Family Apartment" },
            ].map((r) => (
              <div key={r.key} className="space-y-1.5">
                <Label className="text-xs">{r.label}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">GH₵</span>
                  <Input type="number" value={settings[r.key]} onChange={(e) => update(r.key, e.target.value)} min={0} step={10} className="h-9" />
                </div>
              </div>
            ))}
          </div>
          <SaveButton section="pricing" saving={saving} saved={saved} onClick={() => saveSection("pricing", ["price_2in1", "price_4in1", "price_6in1", "price_suite_fan", "price_suite_ac", "price_apartment"])} />
        </div>
      )}

      {/* Notifications */}
      {activeTab === "notifications" && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold">Admin Notification Contacts</h3>
            <p className="text-xs text-muted-foreground -mt-2">Where to send booking, contact, and complaint alerts. Falls back to the property phone/email if left empty.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Admin Phone (SMS)</Label>
                <Input value={settings.admin_notif_phone} onChange={(e) => update("admin_notif_phone", e.target.value)} placeholder="e.g. +233 546 802 414" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Admin Email</Label>
                <Input value={settings.admin_notif_email} onChange={(e) => update("admin_notif_email", e.target.value)} placeholder="e.g. admin@wptc.com" className="h-9" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { key: "notif_new_booking", label: "New booking alert", desc: "Get notified when a new booking or contact form is submitted" },
                { key: "notif_payment", label: "Payment received", desc: "Notification when payment is recorded" },
                { key: "notif_checkin_reminder", label: "Check-in reminder", desc: "Remind staff about expected check-ins" },
                { key: "notif_low_inventory", label: "Low inventory alert", desc: "Alert when supplies run low" },
                { key: "notif_complaint", label: "Complaint alert", desc: "Immediate notification for new complaints" },
              ].map((n) => (
                <SwitchRow key={n.key} label={n.label} desc={n.desc} checked={settings[n.key] === "true"} onToggle={() => toggleSwitch(n.key)} />
              ))}
            </div>
            <SaveButton section="notifications" saving={saving} saved={saved} onClick={() => saveSection("notifications", ["notif_new_booking", "notif_payment", "notif_checkin_reminder", "notif_low_inventory", "notif_complaint", "admin_notif_phone", "admin_notif_email"])} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SwitchRow({ label, desc, checked, onToggle }: {
  label: string; desc: string; checked: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}

function SaveButton({ section, saving, saved, onClick }: {
  section: string; saving: string | null; saved: string | null; onClick: () => void;
}) {
  const isSaving = saving === section;
  const isSaved = saved === section;

  return (
    <Button onClick={onClick} disabled={isSaving} size="sm" className="gap-1.5">
      {isSaving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving...</>
        : isSaved ? <><CheckCircle className="h-3.5 w-3.5" />Saved!</>
        : <><Save className="h-3.5 w-3.5" />Save Changes</>}
    </Button>
  );
}
