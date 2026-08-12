"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberStepper } from "@/components/ui/number-stepper";
import { SITE } from "@/lib/site-data";
import { IMAGES } from "@/lib/images";
import {
  CalendarCheck,
  User,
  Heart,
  Shield,
  BedDouble,
  Clock,
  CreditCard,
  Church,
  Users,
  AlertCircle,
  ChevronDown,
  Loader2,
  CheckCircle,
} from "lucide-react";

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        access_code?: string;
        onClose: () => void;
        callback: (response: { reference: string }) => void;
      }) => { openIframe: () => void };
    };
  }
}

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

const HALL_OPTIONS = [
  { label: "Faith Hall (without AC)", price: 400 },
  { label: "Faith Hall (with AC)", price: 550 },
  { label: "Pavilion (with canopy)", price: 900 },
  { label: "Pavilion (without canopy)", price: 700 },
  { label: "Kitchen & Dining (55+ persons)", price: 500 },
  { label: "Kitchen & Dining (30-50 persons)", price: 400 },
  { label: "Kitchen & Dining (below 20 persons)", price: 250 },
];

const WEDDING_GROUNDS_PRICE = 4000;

const inputClass = "bg-luxury border-gold/15 text-warm-white placeholder:text-warm-muted/40 focus-visible:ring-gold/30";
const selectClass = "w-full h-9 rounded-md border border-gold/15 bg-luxury px-3 text-sm text-warm-white focus:outline-none focus:ring-2 focus:ring-gold/30";
const labelClass = "text-warm-muted text-xs tracking-wide";

function SectionCard({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-luxury-card/80 backdrop-blur-sm border border-gold/10 overflow-hidden">
      <div className="h-px bg-gradient-to-r from-gold/30 via-gold/10 to-transparent" />
      <div className="p-6 md:p-8">
        <h2 className="text-lg font-semibold text-warm-white mb-6 flex items-center gap-2.5">
          <Icon className="h-4.5 w-4.5 text-gold/60" />
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

export default function BookingPage() {
  const [bookingType, setBookingType] = useState<"individual" | "group">("individual");
  const [isLodging, setIsLodging] = useState<"yes" | "no" | "">("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [nights, setNights] = useState(1);
  const [needsHall, setNeedsHall] = useState<"yes" | "no" | "">("");
  const [selectedHall, setSelectedHall] = useState("");
  const [hallDays, setHallDays] = useState(1);
  const [needsGrounds, setNeedsGrounds] = useState(false);

  const [roomQuantities, setRoomQuantities] = useState<Record<string, number>>({});

  const [showRoomBreakdown, setShowRoomBreakdown] = useState(false);
  const [showHallBreakdown, setShowHallBreakdown] = useState(false);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "",
    denomination: "", ageRange: "", relationship: "",
    emergencyName: "", emergencyRelationship: "", emergencyPhone: "",
    idType: "", idNumber: "",
    fromDate: "", toDate: "", startTime: "", endTime: "",
    specialRequests: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [paymentStep, setPaymentStep] = useState<"idle" | "processing" | "paying" | "verifying">("idle");

  useEffect(() => {
    if (document.getElementById("paystack-inline-script")) return;
    const script = document.createElement("script");
    script.id = "paystack-inline-script";
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const updateField = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      setSubmitError("Please fill in your name, email, and phone number.");
      return;
    }
    if (!formData.fromDate || !formData.toDate) {
      setSubmitError("Please select your check-in and check-out dates.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setPaymentStep("processing");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest: {
            full_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            id_type: formData.idType || undefined,
            id_number: formData.idNumber || undefined,
          },
          booking: {
            check_in: formData.fromDate,
            check_out: formData.toDate,
            nights,
            adults: 1,
            children: 0,
            total_amount: totalAmount,
            booking_type: bookingType === "group" ? "GROUP" : "INDIVIDUAL",
            special_requests: formData.specialRequests || undefined,
            hall_days: needsHall === "yes" ? hallDays : 0,
            hall_amount: hallPrice,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      const ref = data.booking.reference;
      const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

      if (paystackKey && data.payment?.access_code) {
        setPaymentStep("paying");

        await new Promise<void>((resolve) => {
          const check = () => {
            if (window.PaystackPop) return resolve();
            setTimeout(check, 100);
          };
          check();
        });

        await new Promise<void>((resolve, reject) => {
          const handler = window.PaystackPop.setup({
            key: paystackKey,
            email: formData.email,
            amount: data.booking.deposit * 100,
            currency: "GHS",
            ref: data.payment.reference,
            access_code: data.payment.access_code,
            onClose: () => {
              reject(new Error("Payment was cancelled. Your booking has been saved — you can pay later by contacting us with reference: " + ref));
            },
            callback: async (response: { reference: string }) => {
              setPaymentStep("verifying");
              try {
                const verifyRes = await fetch(`/api/payments/verify?reference=${response.reference}`);
                const verifyData = await verifyRes.json();
                if (verifyData.status === "success") {
                  resolve();
                } else {
                  reject(new Error("Payment verification failed. Please contact us with reference: " + ref));
                }
              } catch {
                reject(new Error("Could not verify payment. Please contact us with reference: " + ref));
              }
            },
          });
          handler.openIframe();
        });
      }

      setBookingRef(ref);
      setSubmitted(true);
      setPaymentStep("idle");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setSubmitError(message);
      setPaymentStep("idle");
    } finally {
      setSubmitting(false);
    }
  };

  const roomBreakdownLines = useMemo(() => {
    const lines: { label: string; calc: string; amount: number }[] = [];
    if (bookingType === "individual" && selectedRoom) {
      const room = ROOM_OPTIONS.find((r) => r.label === selectedRoom);
      if (room) {
        lines.push({
          label: room.label,
          calc: `GH₵${room.price} × ${nights} night${nights > 1 ? "s" : ""}`,
          amount: room.price * nights,
        });
      }
    } else if (bookingType === "group") {
      ROOM_OPTIONS.forEach((room) => {
        const qty = roomQuantities[room.label] || 0;
        if (qty > 0) {
          lines.push({
            label: `${room.label} × ${qty} room${qty > 1 ? "s" : ""}`,
            calc: `GH₵${room.price} × ${qty} × ${nights} night${nights > 1 ? "s" : ""}`,
            amount: room.price * qty * nights,
          });
        }
      });
    }
    return lines;
  }, [selectedRoom, nights, bookingType, roomQuantities]);

  const roomPrice = roomBreakdownLines.reduce((s, l) => s + l.amount, 0);

  const hallOption = HALL_OPTIONS.find((h) => h.label === selectedHall);
  const hallBasePrice = needsHall === "yes" && hallOption ? hallOption.price : 0;
  const hallTotal = hallBasePrice * hallDays;
  const groundsPrice = needsGrounds ? WEDDING_GROUNDS_PRICE : 0;
  const hallPrice = hallTotal + groundsPrice;

  const hallBreakdownLines = useMemo(() => {
    const lines: { label: string; calc: string; amount: number }[] = [];
    if (needsHall === "yes" && hallOption) {
      lines.push({
        label: hallOption.label,
        calc: `GH₵${hallOption.price} × ${hallDays} day${hallDays > 1 ? "s" : ""}`,
        amount: hallOption.price * hallDays,
      });
    }
    if (needsGrounds) {
      lines.push({ label: "Wedding Grounds", calc: "Fixed rate", amount: WEDDING_GROUNDS_PRICE });
    }
    return lines;
  }, [needsHall, hallOption, hallDays, needsGrounds]);

  const totalAmount = roomPrice + hallPrice;
  const deposit = Math.ceil(totalAmount * 0.3);
  const balance = totalAmount - deposit;

  const toggleBtnClass = (active: boolean) =>
    `px-6 py-2.5 text-sm font-medium border transition-all duration-200 ${
      active
        ? "border-gold/40 bg-gold/10 text-gold"
        : "border-gold/10 text-warm-muted hover:border-gold/25 hover:text-warm-white"
    }`;

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] overflow-hidden bg-luxury">
        <Image src={IMAGES.hero.booking} alt="Book your stay at WPTC" fill className="object-cover" priority quality={85} />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative h-full flex items-center justify-center text-center">
          <div>
            <div className="w-10 h-px bg-gold mx-auto mb-5" />
            <p className="text-gold/60 text-[11px] tracking-[0.2em] uppercase mb-3">Reservations</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white mb-4">
              Book Your Stay
            </h1>
            <p className="text-warm-muted text-base max-w-2xl mx-auto">
              Complete the form below to reserve your room, suite, or hall. A 30% deposit is required to confirm.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-16 md:py-24 bg-luxury">
        <div className="container mx-auto px-4">
          {submitted ? (
            <div className="max-w-lg mx-auto text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 border border-gold/30 mb-6">
                <CheckCircle className="h-8 w-8 text-gold" />
              </div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-warm-white mb-3">Booking Confirmed!</h2>
              <p className="text-warm-muted mb-2">Your booking reference is:</p>
              <p className="text-3xl font-bold text-gold font-mono mb-6">{bookingRef}</p>
              <p className="text-sm text-warm-muted mb-8">
                Payment received! A confirmation SMS has been sent to {formData.phone}.
                Please save your reference number for check-in.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/">
                  <Button className="bg-gold text-luxury hover:bg-gold-bright font-semibold text-[11px] tracking-[0.1em] uppercase h-10 px-6">Return to Homepage</Button>
                </a>
                <a href="/booking">
                  <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 text-[11px] tracking-[0.1em] uppercase h-10 px-6">Make Another Booking</Button>
                </a>
              </div>
            </div>
          ) : (
          <form
            className="max-w-4xl mx-auto space-y-6"
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          >
            {/* Booking Type */}
            <SectionCard icon={Users} title="Booking Type">
              <div className="flex gap-3">
                {(["individual", "group"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBookingType(type)}
                    className={toggleBtnClass(bookingType === type) + " flex-1"}
                  >
                    {type === "individual" ? "Individual" : "Group"}
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* Personal Information */}
            <SectionCard icon={User} title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className={labelClass}>
                    {bookingType === "group" ? "Booker Name" : "Name"} <span className="text-red-400">*</span>
                  </Label>
                  <Input id="name" placeholder="Full name" value={formData.name} onChange={(e) => updateField("name", e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageRange" className={labelClass}>Age Range</Label>
                  <select id="ageRange" value={formData.ageRange} onChange={(e) => updateField("ageRange", e.target.value)} className={selectClass}>
                    <option value="">Select age range</option>
                    {AGE_RANGES.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className={labelClass}>Email <span className="text-red-400">*</span></Label>
                  <Input id="email" type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => updateField("email", e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className={labelClass}>Phone / Mobile <span className="text-red-400">*</span></Label>
                  <Input id="phone" type="tel" placeholder="+233 XXX XXX XXX" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className={labelClass}>Address</Label>
                  <Input id="address" placeholder="Your address" value={formData.address} onChange={(e) => updateField("address", e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="denomination" className={labelClass}>Denomination</Label>
                  <Input id="denomination" placeholder="e.g. Methodist, Catholic, Pentecostal" value={formData.denomination} onChange={(e) => updateField("denomination", e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship" className={labelClass}>Relationship Status</Label>
                  <select id="relationship" value={formData.relationship} onChange={(e) => updateField("relationship", e.target.value)} className={selectClass}>
                    <option value="">Select status</option>
                    {RELATIONSHIP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* Emergency Contact */}
            <SectionCard icon={Heart} title="Emergency Contact">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName" className={labelClass}>Contact Name</Label>
                  <Input id="emergencyName" placeholder="Emergency contact name" value={formData.emergencyName} onChange={(e) => updateField("emergencyName", e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyRelationship" className={labelClass}>Relationship</Label>
                  <Input id="emergencyRelationship" placeholder="e.g. Spouse, Parent, Sibling" value={formData.emergencyRelationship} onChange={(e) => updateField("emergencyRelationship", e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone" className={labelClass}>Contact Phone</Label>
                  <Input id="emergencyPhone" type="tel" placeholder="+233 XXX XXX XXX" value={formData.emergencyPhone} onChange={(e) => updateField("emergencyPhone", e.target.value)} className={inputClass} />
                </div>
              </div>
            </SectionCard>

            {/* Identification */}
            <SectionCard icon={Shield} title="Identification">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="idType" className={labelClass}>ID Card Type</Label>
                  <select id="idType" value={formData.idType} onChange={(e) => updateField("idType", e.target.value)} className={selectClass}>
                    <option value="">Select ID type</option>
                    {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber" className={labelClass}>ID Card Number</Label>
                  <Input id="idNumber" placeholder="Enter your ID number" value={formData.idNumber} onChange={(e) => updateField("idNumber", e.target.value)} className={inputClass} />
                </div>
              </div>
            </SectionCard>

            {/* Lodging Details */}
            <SectionCard icon={BedDouble} title="Lodging Details">
              <div className="mb-6">
                <Label className={labelClass + " mb-3 block"}>Are you lodging?</Label>
                <div className="flex gap-3">
                  {(["yes", "no"] as const).map((opt) => (
                    <button key={opt} type="button" onClick={() => setIsLodging(opt)} className={toggleBtnClass(isLodging === opt) + " px-8"}>
                      {opt === "yes" ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>

              {isLodging === "yes" && (
                <div className="space-y-6">
                  {bookingType === "individual" ? (
                    <div className="space-y-2">
                      <Label htmlFor="roomType" className={labelClass}>Room Type</Label>
                      <select id="roomType" value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} className={selectClass}>
                        <option value="">Select a room</option>
                        {ROOM_OPTIONS.map((r) => (
                          <option key={r.label} value={r.label}>{r.label} — GH₵{r.price}/night</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Label className={labelClass}>Room Quantities</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ROOM_OPTIONS.map((r) => (
                          <div key={r.label} className="flex items-center justify-between p-3 border border-gold/10 bg-luxury">
                            <div>
                              <p className="text-sm font-medium text-warm-white">{r.label}</p>
                              <p className="text-xs text-warm-muted">GH₵{r.price}/night</p>
                            </div>
                            <NumberStepper
                              value={roomQuantities[r.label] || 0}
                              onChange={(val) => setRoomQuantities((prev) => ({ ...prev, [r.label]: val }))}
                              min={0}
                              max={20}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className={labelClass}>Number of Nights</Label>
                    <NumberStepper value={nights} onChange={setNights} min={1} max={90} />
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Hall / Grounds Usage */}
            <SectionCard icon={Church} title="Hall / Grounds Usage">
              <div className="mb-6">
                <Label className={labelClass + " mb-3 block"}>Will you be using any halls?</Label>
                <div className="flex gap-3">
                  {(["yes", "no"] as const).map((opt) => (
                    <button key={opt} type="button" onClick={() => setNeedsHall(opt)} className={toggleBtnClass(needsHall === opt) + " px-8"}>
                      {opt === "yes" ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>

              {needsHall === "yes" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="hall" className={labelClass}>Select Hall / Venue</Label>
                    <select id="hall" value={selectedHall} onChange={(e) => setSelectedHall(e.target.value)} className={selectClass}>
                      <option value="">Choose a hall</option>
                      {HALL_OPTIONS.map((h) => (
                        <option key={h.label} value={h.label}>{h.label} — GH₵{h.price}/day</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>Duration of Hall Usage (days)</Label>
                    <NumberStepper value={hallDays} onChange={setHallDays} min={1} max={30} />
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="weddingGrounds"
                  checked={needsGrounds}
                  onChange={(e) => setNeedsGrounds(e.target.checked)}
                  className="h-4 w-4 rounded border-gold/30 bg-luxury text-gold focus:ring-gold/30"
                />
                <Label htmlFor="weddingGrounds" className="text-sm text-warm-muted cursor-pointer">
                  I need the grounds for a Wedding Ceremony (GH₵{WEDDING_GROUNDS_PRICE.toLocaleString()})
                </Label>
              </div>
            </SectionCard>

            {/* Stay Duration */}
            <SectionCard icon={Clock} title="Stay Duration">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="fromDate" className={labelClass}>From Date <span className="text-red-400">*</span></Label>
                  <Input id="fromDate" type="date" value={formData.fromDate} onChange={(e) => updateField("fromDate", e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toDate" className={labelClass}>To Date <span className="text-red-400">*</span></Label>
                  <Input id="toDate" type="date" value={formData.toDate} onChange={(e) => updateField("toDate", e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime" className={labelClass}>Starting Time</Label>
                  <Input id="startTime" type="time" value={formData.startTime} onChange={(e) => updateField("startTime", e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className={labelClass}>Ending Time</Label>
                  <Input id="endTime" type="time" value={formData.endTime} onChange={(e) => updateField("endTime", e.target.value)} className={inputClass} />
                </div>
              </div>
            </SectionCard>

            {/* Payment Summary */}
            <SectionCard icon={CreditCard} title="Payment Summary">
              <div className="space-y-1 mb-6">
                {/* Room Amount */}
                <div>
                  <button
                    type="button"
                    onClick={() => roomBreakdownLines.length > 0 && setShowRoomBreakdown(!showRoomBreakdown)}
                    className="flex items-center justify-between w-full py-3 border-b border-dashed border-gold/10 group"
                  >
                    <span className="text-sm text-warm-muted flex items-center gap-1.5">
                      Total Room Amount
                      {roomBreakdownLines.length > 0 && (
                        <ChevronDown className={`h-3.5 w-3.5 text-gold/50 transition-transform ${showRoomBreakdown ? "rotate-180" : ""}`} />
                      )}
                    </span>
                    <span className="text-sm font-semibold text-warm-white">GH₵{roomPrice.toFixed(2)}</span>
                  </button>
                  {showRoomBreakdown && roomBreakdownLines.length > 0 && (
                    <div className="ml-4 py-2 space-y-1.5 border-l-2 border-gold/15 pl-4 my-2">
                      {roomBreakdownLines.map((line, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-medium text-warm-white/80">{line.label}</span>
                            <span className="text-warm-muted ml-2">{line.calc}</span>
                          </div>
                          <span className="font-semibold text-warm-white/80">= GH₵{line.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hall Amount */}
                <div>
                  <button
                    type="button"
                    onClick={() => hallBreakdownLines.length > 0 && setShowHallBreakdown(!showHallBreakdown)}
                    className="flex items-center justify-between w-full py-3 border-b border-dashed border-gold/10 group"
                  >
                    <span className="text-sm text-warm-muted flex items-center gap-1.5">
                      Halls / Grounds Amount
                      {hallBreakdownLines.length > 0 && (
                        <ChevronDown className={`h-3.5 w-3.5 text-gold/50 transition-transform ${showHallBreakdown ? "rotate-180" : ""}`} />
                      )}
                    </span>
                    <span className="text-sm font-semibold text-warm-white">GH₵{hallPrice.toFixed(2)}</span>
                  </button>
                  {showHallBreakdown && hallBreakdownLines.length > 0 && (
                    <div className="ml-4 py-2 space-y-1.5 border-l-2 border-gold/15 pl-4 my-2">
                      {hallBreakdownLines.map((line, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-medium text-warm-white/80">{line.label}</span>
                            <span className="text-warm-muted ml-2">{line.calc}</span>
                          </div>
                          <span className="font-semibold text-warm-white/80">= GH₵{line.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="flex items-center justify-between py-3 border-b-2 border-gold/20">
                  <span className="text-base font-bold text-warm-white">Overall Total</span>
                  <span className="text-lg font-bold text-gold">GH₵{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-warm-muted">Initial Deposit (30%)</span>
                  <span className="text-sm font-semibold text-gold">GH₵{deposit.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-warm-muted">Balance Due on Arrival</span>
                  <span className="text-sm font-semibold text-warm-white">GH₵{balance.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border border-gold/15 bg-gold/5 mb-6">
                <AlertCircle className="h-5 w-5 text-gold/60 shrink-0 mt-0.5" />
                <p className="text-sm text-warm-muted">
                  A 30% initial deposit is required to confirm your booking. The remaining
                  balance is due upon arrival. Payment processing fees may apply.
                </p>
              </div>

              {submitError && (
                <div className="flex items-start gap-3 p-4 border border-red-500/30 bg-red-500/10 mb-4">
                  <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{submitError}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gold text-luxury hover:bg-gold-bright font-bold text-[12px] tracking-[0.1em] uppercase h-12 disabled:opacity-60"
              >
                {paymentStep === "processing" ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" />Creating booking...</>
                ) : paymentStep === "paying" ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" />Complete payment in popup...</>
                ) : paymentStep === "verifying" ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" />Verifying payment...</>
                ) : (
                  "Book Now & Pay Deposit"
                )}
              </Button>
            </SectionCard>
          </form>
          )}
        </div>
      </section>
    </>
  );
}
