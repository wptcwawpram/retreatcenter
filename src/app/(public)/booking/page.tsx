"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SITE, ROOMS, HALLS } from "@/lib/site-data";
import {
  CalendarCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  Shield,
  BedDouble,
  Clock,
  CreditCard,
  Church,
  Users,
  AlertCircle,
} from "lucide-react";

const AGE_RANGES = [
  "18-25", "26-30", "31-36", "36-40", "41-45",
  "46-50", "51-55", "56-60", "61-65", "66-70", "Above 71",
];

const RELATIONSHIP_STATUSES = ["Married", "Single", "In a Relationship", "Divorced"];

const ID_TYPES = ["Ghana Card", "Passport", "Driver's License"];

const ROOM_OPTIONS = [
  { label: "2 IN 1", price: 150 },
  { label: "4 IN 1", price: 200 },
  { label: "6 IN 1", price: 270 },
  { label: "Suite (Fan)", price: 350 },
  { label: "Suite (AC)", price: 750 },
  { label: "Holy Family Apartment", price: 750 },
];

const HALL_OPTIONS = ["Faith Hall", "Pavilion", "Common Room"];

export default function BookingPage() {
  const [bookingType, setBookingType] = useState<"individual" | "group">("individual");
  const [isLodging, setIsLodging] = useState<"yes" | "no" | "">("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [nights, setNights] = useState(1);
  const [needsHall, setNeedsHall] = useState<"yes" | "no" | "">("");
  const [selectedHall, setSelectedHall] = useState("");
  const [hallDays, setHallDays] = useState(1);
  const [needsGrounds, setNeedsGrounds] = useState(false);
  const [pavilionCanopy, setPavilionCanopy] = useState<"with" | "without">("with");

  // Group room quantities
  const [roomQuantities, setRoomQuantities] = useState<Record<string, number>>({});

  const roomPrice = useMemo(() => {
    if (bookingType === "individual") {
      const room = ROOM_OPTIONS.find((r) => r.label === selectedRoom);
      return room ? room.price * nights : 0;
    }
    // Group: sum all room quantities × price × nights
    return ROOM_OPTIONS.reduce((total, room) => {
      const qty = roomQuantities[room.label] || 0;
      return total + room.price * qty * nights;
    }, 0);
  }, [selectedRoom, nights, bookingType, roomQuantities]);

  const hallPrice = needsHall === "yes" ? hallDays * 200 : 0; // placeholder hall pricing
  const totalAmount = roomPrice + hallPrice;
  const deposit = Math.ceil(totalAmount * 0.3);
  const balance = totalAmount - deposit;

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-amber-950 via-amber-900 to-amber-800 text-white py-20 md:py-28">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 text-amber-200 border-amber-400/30 bg-white/10 px-4 py-1">
            <CalendarCheck className="h-3.5 w-3.5 mr-1" />
            Book Your Stay
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Warriors Prayer Tower Complex{" "}
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Form
            </span>
          </h1>
          <p className="text-lg text-amber-100/80 max-w-2xl mx-auto">
            Complete the form below to reserve your room, suite, or hall.
            A 30% deposit is required to confirm your booking.
          </p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-amber-50/30 to-white">
        <div className="container mx-auto px-4">
          <form
            className="max-w-4xl mx-auto space-y-8"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* ─── Booking Type ─── */}
            <Card className="border-0 ring-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400" />
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-700" />
                  Booking Type
                </h2>
                <div className="flex gap-4">
                  {(["individual", "group"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBookingType(type)}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold border-2 transition-all ${
                        bookingType === type
                          ? "border-amber-500 bg-amber-50 text-amber-900"
                          : "border-gray-200 text-gray-500 hover:border-amber-300"
                      }`}
                    >
                      {type === "individual" ? "Individual" : "Group"}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ─── Personal Information ─── */}
            <Card className="border-0 ring-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400" />
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-700" />
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {bookingType === "group" ? "Booker Name" : "Name"} <span className="text-red-500">*</span>
                    </Label>
                    <Input id="name" placeholder="Full name" className="border-gray-200 focus-visible:ring-amber-500" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ageRange">Age Range</Label>
                    <select
                      id="ageRange"
                      className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select age range</option>
                      {AGE_RANGES.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input id="email" type="email" placeholder="your@email.com" className="border-gray-200 focus-visible:ring-amber-500" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone / Mobile <span className="text-red-500">*</span></Label>
                    <Input id="phone" type="tel" placeholder="+233 XXX XXX XXX" className="border-gray-200 focus-visible:ring-amber-500" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="Your address" className="border-gray-200 focus-visible:ring-amber-500" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="denomination">Denomination</Label>
                    <Input id="denomination" placeholder="e.g. Methodist, Catholic, Pentecostal" className="border-gray-200 focus-visible:ring-amber-500" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship Status</Label>
                    <select
                      id="relationship"
                      className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select status</option>
                      {RELATIONSHIP_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─── Emergency Contact ─── */}
            <Card className="border-0 ring-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400" />
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-amber-700" />
                  Emergency Contact
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">Contact Name</Label>
                    <Input id="emergencyName" placeholder="Emergency contact name" className="border-gray-200 focus-visible:ring-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyRelationship">Relationship</Label>
                    <Input id="emergencyRelationship" placeholder="e.g. Spouse, Parent, Sibling" className="border-gray-200 focus-visible:ring-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Contact Phone</Label>
                    <Input id="emergencyPhone" type="tel" placeholder="+233 XXX XXX XXX" className="border-gray-200 focus-visible:ring-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─── Identification ─── */}
            <Card className="border-0 ring-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400" />
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-700" />
                  Identification
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="idType">ID Card Type</Label>
                    <select
                      id="idType"
                      className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select ID type</option>
                      {ID_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Card Number</Label>
                    <Input id="idNumber" placeholder="Enter your ID number" className="border-gray-200 focus-visible:ring-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─── Lodging Details ─── */}
            <Card className="border-0 ring-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400" />
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BedDouble className="h-5 w-5 text-amber-700" />
                  Lodging Details
                </h2>

                {/* Are you lodging? */}
                <div className="mb-6">
                  <Label className="mb-3 block">Are you lodging?</Label>
                  <div className="flex gap-4">
                    {(["yes", "no"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setIsLodging(opt)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                          isLodging === opt
                            ? "border-amber-500 bg-amber-50 text-amber-900"
                            : "border-gray-200 text-gray-500 hover:border-amber-300"
                        }`}
                      >
                        {opt === "yes" ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>

                {isLodging === "yes" && (
                  <div className="space-y-6">
                    {bookingType === "individual" ? (
                      /* Individual: single room select */
                      <div className="space-y-2">
                        <Label htmlFor="roomType">Room Type</Label>
                        <select
                          id="roomType"
                          value={selectedRoom}
                          onChange={(e) => setSelectedRoom(e.target.value)}
                          className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="">Select a room</option>
                          {ROOM_OPTIONS.map((r) => (
                            <option key={r.label} value={r.label}>
                              {r.label} — GH₵{r.price}/night
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      /* Group: quantity per room type */
                      <div className="space-y-4">
                        <Label>Room Quantities</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {ROOM_OPTIONS.map((r) => (
                            <div
                              key={r.label}
                              className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900">{r.label}</p>
                                <p className="text-xs text-gray-400">GH₵{r.price}/night</p>
                              </div>
                              <Input
                                type="number"
                                min={0}
                                value={roomQuantities[r.label] || 0}
                                onChange={(e) =>
                                  setRoomQuantities((prev) => ({
                                    ...prev,
                                    [r.label]: Math.max(0, parseInt(e.target.value) || 0),
                                  }))
                                }
                                className="w-20 h-9 text-center border-gray-200 focus-visible:ring-amber-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="nights">Number of Nights</Label>
                      <Input
                        id="nights"
                        type="number"
                        min={1}
                        value={nights}
                        onChange={(e) => setNights(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-32 border-gray-200 focus-visible:ring-amber-500"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ─── Hall / Grounds Usage ─── */}
            <Card className="border-0 ring-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400" />
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Church className="h-5 w-5 text-amber-700" />
                  Hall / Grounds Usage
                </h2>

                <div className="mb-6">
                  <Label className="mb-3 block">Will you be using any halls?</Label>
                  <div className="flex gap-4">
                    {(["yes", "no"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setNeedsHall(opt)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                          needsHall === opt
                            ? "border-amber-500 bg-amber-50 text-amber-900"
                            : "border-gray-200 text-gray-500 hover:border-amber-300"
                        }`}
                      >
                        {opt === "yes" ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>

                {needsHall === "yes" && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="hall">Select Hall</Label>
                      <select
                        id="hall"
                        value={selectedHall}
                        onChange={(e) => setSelectedHall(e.target.value)}
                        className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">Choose a hall</option>
                        {HALL_OPTIONS.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>

                    {selectedHall === "Pavilion" && (
                      <div className="space-y-2">
                        <Label>Pavilion Canopy</Label>
                        <div className="flex gap-4">
                          {(["with", "without"] as const).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setPavilionCanopy(opt)}
                              className={`px-5 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                                pavilionCanopy === opt
                                  ? "border-amber-500 bg-amber-50 text-amber-900"
                                  : "border-gray-200 text-gray-500 hover:border-amber-300"
                              }`}
                            >
                              {opt === "with" ? "With Canopy" : "Without Canopy"}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="hallDays">Duration of Hall Usage (days)</Label>
                      <Input
                        id="hallDays"
                        type="number"
                        min={1}
                        value={hallDays}
                        onChange={(e) => setHallDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-32 border-gray-200 focus-visible:ring-amber-500"
                      />
                    </div>
                  </div>
                )}

                {/* Wedding grounds checkbox */}
                <div className="mt-6 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="weddingGrounds"
                    checked={needsGrounds}
                    onChange={(e) => setNeedsGrounds(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <Label htmlFor="weddingGrounds" className="text-sm text-gray-700 cursor-pointer">
                    I need the grounds for a Wedding Ceremony
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* ─── Stay Duration ─── */}
            <Card className="border-0 ring-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400" />
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-700" />
                  Stay Duration
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="fromDate">From Date <span className="text-red-500">*</span></Label>
                    <Input id="fromDate" type="date" className="border-gray-200 focus-visible:ring-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toDate">To Date <span className="text-red-500">*</span></Label>
                    <Input id="toDate" type="date" className="border-gray-200 focus-visible:ring-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Starting Time</Label>
                    <Input id="startTime" type="time" className="border-gray-200 focus-visible:ring-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Ending Time</Label>
                    <Input id="endTime" type="time" className="border-gray-200 focus-visible:ring-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─── Payment Summary ─── */}
            <Card className="border-0 ring-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400" />
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-amber-700" />
                  Payment Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-200">
                    <span className="text-sm text-gray-600">Total Room Amount</span>
                    <span className="text-sm font-semibold text-gray-900">GH₵{roomPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-200">
                    <span className="text-sm text-gray-600">Halls / Grounds Amount</span>
                    <span className="text-sm font-semibold text-gray-900">GH₵{hallPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b-2 border-amber-300">
                    <span className="text-base font-bold text-gray-900">Overall Total</span>
                    <span className="text-lg font-bold text-amber-800">GH₵{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Initial Deposit (30%)</span>
                    <span className="text-sm font-semibold text-amber-700">GH₵{deposit.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Balance Due on Arrival</span>
                    <span className="text-sm font-semibold text-gray-900">GH₵{balance.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    A 30% initial deposit is required to confirm your booking. The remaining
                    balance is due upon arrival. Payment processing fees may apply.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold text-base h-12 shadow-lg shadow-amber-700/20"
                >
                  Book Now!
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </section>
    </>
  );
}
