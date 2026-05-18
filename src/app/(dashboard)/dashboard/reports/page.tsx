"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/format";
import { BarChart3, TrendingUp, Users, BedDouble } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Analytics and insights for your operations" />

      <Tabs defaultValue="occupancy">
        <TabsList>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
        </TabsList>

        <TabsContent value="occupancy" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="p-6 text-center">
              <BedDouble className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-3xl font-bold">57%</p>
              <p className="text-sm text-muted-foreground">Current Occupancy</p>
            </CardContent></Card>
            <Card><CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
              <p className="text-3xl font-bold">72%</p>
              <p className="text-sm text-muted-foreground">Avg This Month</p>
            </CardContent></Card>
            <Card><CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <p className="text-3xl font-bold">85%</p>
              <p className="text-sm text-muted-foreground">Peak (Weekends)</p>
            </CardContent></Card>
          </div>

          {/* Weekly occupancy chart placeholder */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Weekly Occupancy Trend</h3>
              <div className="space-y-3">
                {[
                  { day: "Mon", pct: 45 }, { day: "Tue", pct: 52 }, { day: "Wed", pct: 58 },
                  { day: "Thu", pct: 65 }, { day: "Fri", pct: 78 }, { day: "Sat", pct: 85 }, { day: "Sun", pct: 70 },
                ].map((d) => (
                  <div key={d.day} className="flex items-center gap-3">
                    <span className="w-10 text-sm font-medium">{d.day}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${d.pct}%` }} />
                    </div>
                    <span className="w-12 text-sm font-medium text-right">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">This Month</p>
              <p className="text-3xl font-bold text-emerald-600">{formatCurrency(28500)}</p>
            </CardContent></Card>
            <Card><CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Last Month</p>
              <p className="text-3xl font-bold">{formatCurrency(22300)}</p>
            </CardContent></Card>
            <Card><CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Growth</p>
              <p className="text-3xl font-bold text-emerald-600">+27.8%</p>
            </CardContent></Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Revenue by Source</h3>
              <div className="space-y-3">
                {[
                  { source: "Room Revenue", amount: 18500, pct: 65 },
                  { source: "Hall/Venue Revenue", amount: 5400, pct: 19 },
                  { source: "Cafeteria", amount: 3200, pct: 11 },
                  { source: "Laundry & Other", amount: 1400, pct: 5 },
                ].map((s) => (
                  <div key={s.source} className="flex items-center gap-3">
                    <span className="w-40 text-sm">{s.source}</span>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.pct}%` }} />
                    </div>
                    <span className="w-24 text-sm font-medium text-right">{formatCurrency(s.amount)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Total Bookings", value: "42" },
              { label: "Checked In", value: "8" },
              { label: "Confirmed", value: "12" },
              { label: "Cancellation Rate", value: "4.8%" },
            ].map((s) => (
              <Card key={s.label}><CardContent className="p-6 text-center">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="guests" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-3xl font-bold">156</p>
              <p className="text-sm text-muted-foreground">Total Guests</p>
            </CardContent></Card>
            <Card><CardContent className="p-6 text-center">
              <p className="text-3xl font-bold">34%</p>
              <p className="text-sm text-muted-foreground">Repeat Visitors</p>
            </CardContent></Card>
            <Card><CardContent className="p-6 text-center">
              <p className="text-3xl font-bold">2.4</p>
              <p className="text-sm text-muted-foreground">Avg Stay (nights)</p>
            </CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
