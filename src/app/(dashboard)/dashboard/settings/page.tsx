"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SITE } from "@/lib/site-data";
import { Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="System configuration and preferences" />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <h3 className="font-semibold">Property Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Property Name</Label>
                  <Input defaultValue={SITE.name} />
                </div>
                <div className="space-y-2">
                  <Label>Short Name</Label>
                  <Input defaultValue={SITE.shortName} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue={SITE.phone} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue={SITE.email} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Input defaultValue={SITE.fullAddress} />
                </div>
              </div>
              <Button className="gap-1.5"><Save className="h-4 w-4" />Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">System Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Auto-assign housekeeping</p>
                    <p className="text-xs text-muted-foreground">Automatically create cleaning tasks after check-out</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Booking confirmation SMS</p>
                    <p className="text-xs text-muted-foreground">Send SMS when a booking is confirmed</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Require deposit</p>
                    <p className="text-xs text-muted-foreground">Require 30% deposit for all bookings</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <h3 className="font-semibold">Room Pricing (per night)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "2 in 1 Room", price: "150" },
                  { label: "4 in 1 Room", price: "200" },
                  { label: "6 in 1 Room", price: "270" },
                  { label: "Suite (Fan)", price: "350" },
                  { label: "Suite (AC)", price: "750" },
                  { label: "Holy Family Apartment", price: "750" },
                ].map((r) => (
                  <div key={r.label} className="space-y-2">
                    <Label>{r.label}</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">GH₵</span>
                      <Input defaultValue={r.price} type="number" />
                    </div>
                  </div>
                ))}
              </div>
              <Button className="gap-1.5"><Save className="h-4 w-4" />Update Pricing</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: "New booking alert", desc: "Get notified when a new booking is created" },
                  { label: "Payment received", desc: "Notification when payment is recorded" },
                  { label: "Check-in reminder", desc: "Remind staff about expected check-ins" },
                  { label: "Low inventory alert", desc: "Alert when supplies run low" },
                  { label: "Complaint alert", desc: "Immediate notification for new complaints" },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
