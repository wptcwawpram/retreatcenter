"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, CheckCircle, Building2, Tag, Bell, User, Camera, Plus, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { MESSAGE_TEMPLATES } from "@/lib/message-templates";

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
  price_3in1: "180",
  price_4in1: "200",
  price_6in1: "270",
  price_suite_fan: "350",
  price_suite_ac: "500",
  price_apartment: "750",
  price_faith_hall_no_ac: "400",
  price_faith_hall_ac: "550",
  price_pavilion_canopy: "900",
  price_pavilion_no_canopy: "700",
  price_kitchen_55plus: "500",
  price_kitchen_30to50: "400",
  price_kitchen_below20: "250",
  price_wedding_grounds: "4000",
  notif_new_booking: "true",
  notif_payment: "true",
  notif_checkin_reminder: "true",
  notif_low_inventory: "true",
  notif_complaint: "true",
  admin_notif_phone: "",
  admin_notif_email: "",
};

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "general" | "pricing" | "notifications" | "messages">("profile");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([settingsData, meData]) => {
      if (settingsData.settings) setSettings((prev) => ({ ...prev, ...settingsData.settings }));
      if (meData.user) {
        setProfile(meData.user);
        setProfileName(meData.user.full_name || "");
        setProfilePhone(meData.user.phone || "");
        setAvatarPreview(meData.user.avatar_url || null);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAvatarUpload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) { alert("Image must be under 2MB"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { alert("Only JPEG, PNG, or WebP allowed"); return; }
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/employees/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAvatarPreview(data.avatar_url);
      setSaved("avatar");
      setTimeout(() => setSaved(null), 3000);
    } catch { alert("Failed to upload photo"); }
    finally { setUploadingAvatar(false); }
  };

  const handleProfileSave = async () => {
    if (!profile) return;
    setSaving("profile");
    try {
      const res = await fetch("/api/employees/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: profileName, phone: profilePhone || null }),
      });
      if (!res.ok) throw new Error("Failed");
      setSaved("profile");
      setTimeout(() => setSaved(null), 3000);
    } catch { alert("Failed to save profile"); }
    finally { setSaving(null); }
  };

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
    { key: "profile" as const, label: "My Profile", icon: User },
    { key: "general" as const, label: "General", icon: Building2 },
    { key: "pricing" as const, label: "Pricing", icon: Tag },
    { key: "notifications" as const, label: "Notifications", icon: Bell },
    { key: "messages" as const, label: "Messages", icon: MessageSquare },
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

      {/* Profile */}
      {activeTab === "profile" && profile && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-5">
            <h3 className="text-sm font-semibold">Profile Photo</h3>
            <div className="flex items-center gap-5">
              <label className="relative cursor-pointer group shrink-0">
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }} />
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="Avatar" width={80} height={80} className="h-20 w-20 rounded-xl object-cover ring-2 ring-primary/20" unoptimized />
                ) : (
                  <div className="h-20 w-20 rounded-xl bg-muted/60 border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 group-hover:border-primary/40 transition-colors">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <Camera className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              </label>
              <div className="space-y-1">
                <p className="text-sm font-medium">{profile.full_name}</p>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
                {uploadingAvatar && (
                  <p className="text-xs text-primary flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Uploading...</p>
                )}
                {saved === "avatar" && (
                  <p className="text-xs text-teal-500 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Photo updated</p>
                )}
                <p className="text-[10px] text-muted-foreground">JPEG, PNG, or WebP. Max 2MB.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-5">
            <h3 className="text-sm font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name</Label>
                <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone</Label>
                <Input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input value={profile.email} disabled className="h-9 opacity-60" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Role</Label>
                <Input value={profile.role} disabled className="h-9 opacity-60" />
              </div>
            </div>
            <SaveButton section="profile" saving={saving} saved={saved} onClick={handleProfileSave} />
          </div>
        </div>
      )}

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
        <div className="space-y-5">
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-5">
            <h3 className="text-sm font-semibold">Room Pricing (per night)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: "price_2in1", label: "2 in 1 Room" },
                { key: "price_3in1", label: "3 in 1 Room" },
                { key: "price_4in1", label: "4 in 1 Room" },
                { key: "price_6in1", label: "6 in 1 Room" },
                { key: "price_suite_fan", label: "Suite (Fan)" },
                { key: "price_suite_ac", label: "Suite (AC)" },
                { key: "price_apartment", label: "Holy Family Apartment" },
              ].map((r) => (
                <PriceField key={r.key} label={r.label} value={settings[r.key]} onChange={(v) => update(r.key, v)} />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">Saving will update all rooms of that type across the entire system.</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-5">
            <h3 className="text-sm font-semibold">Faith Hall Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <PriceField label="Faith Hall (without AC)" value={settings.price_faith_hall_no_ac} onChange={(v) => update("price_faith_hall_no_ac", v)} />
              <PriceField label="Faith Hall (with AC)" value={settings.price_faith_hall_ac} onChange={(v) => update("price_faith_hall_ac", v)} />
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-5">
            <h3 className="text-sm font-semibold">Pavilion Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <PriceField label="Pavilion (with canopy)" value={settings.price_pavilion_canopy} onChange={(v) => update("price_pavilion_canopy", v)} />
              <PriceField label="Pavilion (without canopy)" value={settings.price_pavilion_no_canopy} onChange={(v) => update("price_pavilion_no_canopy", v)} />
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-5">
            <h3 className="text-sm font-semibold">Kitchen & Dining Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <PriceField label="55+ persons" value={settings.price_kitchen_55plus} onChange={(v) => update("price_kitchen_55plus", v)} />
              <PriceField label="30–50 persons" value={settings.price_kitchen_30to50} onChange={(v) => update("price_kitchen_30to50", v)} />
              <PriceField label="Below 20 persons" value={settings.price_kitchen_below20} onChange={(v) => update("price_kitchen_below20", v)} />
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-5">
            <h3 className="text-sm font-semibold">Wedding Grounds</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <PriceField label="Wedding Grounds (flat rate)" value={settings.price_wedding_grounds} onChange={(v) => update("price_wedding_grounds", v)} />
            </div>
          </div>

          <SaveButton section="pricing" saving={saving} saved={saved} onClick={() => saveSection("pricing", [
            "price_2in1", "price_3in1", "price_4in1", "price_6in1", "price_suite_fan", "price_suite_ac", "price_apartment",
            "price_faith_hall_no_ac", "price_faith_hall_ac", "price_pavilion_canopy", "price_pavilion_no_canopy",
            "price_kitchen_55plus", "price_kitchen_30to50", "price_kitchen_below20", "price_wedding_grounds",
          ])} />
        </div>
      )}

      {/* Notifications */}
      {activeTab === "notifications" && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold">Admin Notification Contacts</h3>
            <p className="text-xs text-muted-foreground -mt-2">Where to send booking, contact, and complaint alerts. Falls back to the property phone/email if left empty.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs">Phone Numbers (SMS)</Label>
                {(settings.admin_notif_phone || "").split(",").filter(Boolean).map((phone, i, arr) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Input value={phone.trim()} onChange={(e) => {
                      const phones = (settings.admin_notif_phone || "").split(",").filter(Boolean);
                      phones[i] = e.target.value;
                      update("admin_notif_phone", phones.join(","));
                    }} placeholder="e.g. +233 546 802 414" className="h-9" />
                    {arr.length > 1 && (
                      <button type="button" onClick={() => {
                        const phones = (settings.admin_notif_phone || "").split(",").filter(Boolean);
                        phones.splice(i, 1);
                        update("admin_notif_phone", phones.join(","));
                      }} className="shrink-0 h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {!(settings.admin_notif_phone || "").split(",").filter(Boolean).length && (
                  <Input value="" onChange={(e) => update("admin_notif_phone", e.target.value)} placeholder="e.g. +233 546 802 414" className="h-9" />
                )}
                <button type="button" onClick={() => {
                  const phones = (settings.admin_notif_phone || "").split(",").filter(Boolean);
                  phones.push("");
                  update("admin_notif_phone", phones.join(","));
                }} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors pt-0.5">
                  <Plus className="h-3 w-3" />Add another phone
                </button>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Email Addresses</Label>
                {(settings.admin_notif_email || "").split(",").filter(Boolean).map((email, i, arr) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Input value={email.trim()} onChange={(e) => {
                      const emails = (settings.admin_notif_email || "").split(",").filter(Boolean);
                      emails[i] = e.target.value;
                      update("admin_notif_email", emails.join(","));
                    }} placeholder="e.g. admin@wptc.com" className="h-9" />
                    {arr.length > 1 && (
                      <button type="button" onClick={() => {
                        const emails = (settings.admin_notif_email || "").split(",").filter(Boolean);
                        emails.splice(i, 1);
                        update("admin_notif_email", emails.join(","));
                      }} className="shrink-0 h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {!(settings.admin_notif_email || "").split(",").filter(Boolean).length && (
                  <Input value="" onChange={(e) => update("admin_notif_email", e.target.value)} placeholder="e.g. admin@wptc.com" className="h-9" />
                )}
                <button type="button" onClick={() => {
                  const emails = (settings.admin_notif_email || "").split(",").filter(Boolean);
                  emails.push("");
                  update("admin_notif_email", emails.join(","));
                }} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors pt-0.5">
                  <Plus className="h-3 w-3" />Add another email
                </button>
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

      {/* Messages */}
      {activeTab === "messages" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
            <h3 className="text-sm font-semibold">Message Templates</h3>
            <p className="text-xs text-muted-foreground">Customize the SMS messages sent to guests and staff. Use variables in curly braces like <code className="bg-muted/50 px-1 rounded text-[10px]">{"{guest_name}"}</code> which get replaced with actual values.</p>
          </div>
          {MESSAGE_TEMPLATES.map((tmpl) => (
            <div key={tmpl.key} className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold">{tmpl.label}</h4>
                  <p className="text-[11px] text-muted-foreground">{tmpl.description}</p>
                </div>
                {settings[tmpl.key] && settings[tmpl.key] !== tmpl.defaultText && (
                  <button
                    type="button"
                    onClick={() => update(tmpl.key, tmpl.defaultText)}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap shrink-0"
                  >
                    Reset to default
                  </button>
                )}
              </div>
              <Textarea
                value={settings[tmpl.key] || tmpl.defaultText}
                onChange={(e) => update(tmpl.key, e.target.value)}
                rows={3}
                className="text-sm resize-none"
              />
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] text-muted-foreground mr-1">Variables:</span>
                {tmpl.variables.map((v) => (
                  <span key={v} className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono">{`{${v}}`}</span>
                ))}
              </div>
            </div>
          ))}
          <SaveButton section="messages" saving={saving} saved={saved} onClick={() => saveSection("messages", MESSAGE_TEMPLATES.map((t) => t.key))} />
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

function PriceField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">GH₵</span>
        <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} min={0} step={10} className="h-9" />
      </div>
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
