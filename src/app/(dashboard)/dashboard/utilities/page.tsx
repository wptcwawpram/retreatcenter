"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Droplets, Fuel, Clock } from "lucide-react";

export default function UtilitiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Utilities" description="Monitor power, water, and generator usage" />

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-50">
                <Zap className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold">Power Supply</h3>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 mt-1">Active — ECG</Badge>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Last outage</span><span>14 May, 2:30 PM</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span>3 hours</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Outages this month</span><span className="font-bold">6</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-50">
                <Fuel className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold">Generator</h3>
                <Badge className="bg-gray-100 text-gray-700 border-gray-300 mt-1">Standby</Badge>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Fuel level</span><span className="font-bold">65%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last run</span><span>14 May, 2:30 PM</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total hours</span><span>18h this month</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-50">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Water Supply</h3>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 mt-1">Normal</Badge>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Tank level</span><span className="font-bold">80%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last refill</span><span>16 May</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Issues</span><span>None</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Log */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Recent Utility Logs</h3>
          <div className="space-y-3">
            {[
              { date: "18 May", time: "08:00", event: "ECG power stable", type: "Power" },
              { date: "17 May", time: "22:15", event: "Generator stopped — ECG restored", type: "Generator" },
              { date: "17 May", time: "19:00", event: "Generator started — ECG outage", type: "Generator" },
              { date: "16 May", time: "10:00", event: "Water tank refilled to 100%", type: "Water" },
              { date: "14 May", time: "17:30", event: "ECG power restored", type: "Power" },
              { date: "14 May", time: "14:30", event: "ECG power outage — generator started", type: "Power" },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">{log.event}</span>
                  <span className="text-muted-foreground ml-2">({log.type})</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{log.date}, {log.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
