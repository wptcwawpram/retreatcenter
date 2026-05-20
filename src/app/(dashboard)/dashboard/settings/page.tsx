"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2, CheckCircle } from "lucide-react";

type SettingsMap = Record<string, string>;

// Default values (used until overridden by DB)
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
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // which section is saving
  const [saved, setSaved] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSwitch = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: prev[key] === "true" ? "false" : "true" }));
  };

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
    } catch {
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" description="System configuration and preferences" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="System configuration and preferences" />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* ─── General ─── */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <h3 className="font-semibold">Property Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Property Name</Label>
                  <Input value={settings.property_name} onChange={(e) => update("property_name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Short Name</Label>
                  <Input value={settings.short_name} onChange={(e) => update("short_name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={settings.phone} onChange={(e) => update("phone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={settings.email} onChange={(e) => update("email", e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Input value={settings.address} onChange={(e) => update("address", e.target.value)} />
                </div>
              </div>
              <SaveButton
                section="general"
                saving={saving}
                saved={saved}
                onClick={() => saveSection("general", ["property_name", "short_name", "phone", "email", "address"])}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">System Preferences</h3>
              <div className="space-y-4">
                <SwitchRow
                  label="Auto-assign housekeeping"
                  desc="Automatically create cleaning tasks after check-out"
                  checked={settings.auto_housekeeping === "true"}
                  onToggle={() => toggleSwitch("auto_housekeeping")}
                />
                <SwitchRow
                  label="Booking confirmation SMS"
                  desc="Send SMS when a booking is confirmed"
                  checked={settings.booking_sms === "true"}
                  onToggle={() => toggleSwitch("booking_sms")}
                />
                <SwitchRow
                  label="Require deposit"
                  desc="Require 30% deposit for all bookings"
                  checked={settings.require_deposit === "true"}
                  onToggle={() => toggleSwitch("require_deposit")}
                />
              </div>
              <SaveButton
                section="preferences"
                saving={saving}
                saved={saved}
                onClick={() => saveSection("preferences", ["auto_housekeeping", "booking_sms", "require_deposit"])}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Pricing ─── */}
        <TabsContent value="pricing" className="mt-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <h3 className="font-semibold">Room Pricing (per night)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "price_2in1", label: "2 in 1 Room" },
                  { key: "price_4in1", label: "4 in 1 Room" },
                  { key: "price_6in1", label: "6 in 1 Room" },
                  { key: "price_suite_fan", label: "Suite (Fan)" },
                  { key: "price_suite_ac", label: "Suite (AC)" },
                  { key: "price_apartment", label: "Holy Family Apartment" },
                ].map((r) => (
                  <div key={r.key} className="space-y-2">
                    <Label>{r.label}</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">GH₵</span>
                      <Input
                        type="number"
                        value={settings[r.key]}
                        onChange={(e) => update(r.key, e.target.value)}
                        min={0}
                        step={10}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <SaveButton
                section="pricing"
                saving={saving}
                saved={saved}
                onClick={() =>
                  saveSection("pricing", [
                    "price_2in1", "price_4in1", "price_6in1",
                    "price_suite_fan", "price_suite_ac", "price_apartment",
                  ])
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Notifications ─── */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: "notif_new_booking", label: "New booking alert", desc: "Get notified when a new booking is created" },
                  { key: "notif_payment", label: "Payment received", desc: "Notification when payment is recorded" },
                  { key: "notif_checkin_reminder", label: "Check-in reminder", desc: "Remind staff about expected check-ins" },
                  { key: "notif_low_inventory", label: "Low inventory alert", desc: "Alert when supplies run low" },
                  { key: "notif_complaint", label: "Complaint alert", desc: "Immediate notification for new complaints" },
                ].map((n) => (
                  <SwitchRow
                    key={n.key}
                    label={n.label}
                    desc={n.desc}
                    checked={settings[n.key] === "true"}
                    onToggle={() => toggleSwitch(n.key)}
                  />
                ))}
              </div>
              <SaveButton
                section="notifications"
                saving={saving}
                saved={saved}
                onClick={() =>
                  saveSection("notifications", [
                    "notif_new_booking", "notif_payment", "notif_checkin_reminder",
                    "notif_low_inventory", "notif_complaint",
                  ])
                }
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SwitchRow({ label, desc, checked, onToggle }: {
  label: string; desc: string; checked: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
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
    <Button onClick={onClick} disabled={isSaving} className="gap-1.5">
      {isSaving ? (
        <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
      ) : isSaved ? (
        <><CheckCircle className="h-4 w-4" />Saved!</>
      ) : (
        <><Save className="h-4 w-4" />Save Changes</>
      )}
    </Button>
  );
}
