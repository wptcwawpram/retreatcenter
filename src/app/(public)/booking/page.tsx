"use client";

import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberStepper } from "@/components/ui/number-stepper";
import { SITE, CONTACT_NUMBERS } from "@/lib/site-data";
import { useSiteImages, useSiteBlurs, img, imgBlurStyle } from "@/lib/use-site-images";
import {
  CalendarCheck,
  User,
  Phone,
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
  UtensilsCrossed,
  TreePine,
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

const DEFAULT_ROOM_OPTIONS = [
  { label: "2 IN 1", price: 150, slug: "2-in-1" },
  { label: "4 IN 1", price: 200, slug: "4-in-1" },
  { label: "6 IN 1", price: 270, slug: "6-in-1" },
  { label: "Suite (Fan)", price: 350, slug: "suite-fan" },
  { label: "Suite (AC)", price: 750, slug: "suite-ac" },
  { label: "Holy Family Apartment", price: 750, slug: "holy-family-apartment" },
];

const DEFAULT_HALL_OPTIONS = [
  { label: "Faith Hall (without AC)", price: 400 },
  { label: "Faith Hall (with AC)", price: 550 },
  { label: "Pavilion (with canopy)", price: 900 },
  { label: "Pavilion (without canopy)", price: 700 },
];

const DEFAULT_KITCHEN_OPTIONS = [
  { label: "Kitchen & Dining (55+ persons)", price: 500 },
  { label: "Kitchen & Dining (30-50 persons)", price: 400 },
  { label: "Kitchen & Dining (below 20 persons)", price: 250 },
];

const DEFAULT_WEDDING_GROUNDS_PRICE = 4000;

const inputClass = "bg-luxury border-gold/15 text-warm-white placeholder:text-warm-muted/40 focus-visible:ring-gold/30";
const selectClass = "w-full h-9 rounded-md border border-gold/15 bg-luxury px-3 text-sm text-warm-white focus:outline-none focus:ring-2 focus:ring-gold/30";
const labelClass = "text-warm-muted text-xs tracking-wide";
const checkboxCardClass = (checked: boolean) =>
  `flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-300 select-none backdrop-blur-xl ${
    checked
      ? "border-gold/40 bg-gold/[0.1] shadow-[0_2px_12px_rgba(212,175,55,0.06),inset_0_1px_0_rgba(255,255,255,0.06)]"
      : "border-white/[0.1] bg-white/[0.04] hover:border-gold/25 hover:bg-white/[0.07] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
  }`;

function todayStr() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.max(1, Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24)));
}

function SectionCard({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.1] rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)]">
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

export default function BookingPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-luxury" />}>
      <BookingPage />
    </Suspense>
  );
}

function BookingPage() {
  const siteImages = useSiteImages();
  const siteBlurs = useSiteBlurs();
  const searchParams = useSearchParams();
  const roomParam = searchParams.get("room");
  const [showTypePopup, setShowTypePopup] = useState(true);
  const [bookingType, setBookingType] = useState<"individual" | "group">("individual");
  const [isLodging, setIsLodging] = useState<"yes" | "no" | "">("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [nights, setNights] = useState(1);

  const [ROOM_OPTIONS, setRoomOptions] = useState(DEFAULT_ROOM_OPTIONS);

  const [HALL_OPTIONS, setHallOptions] = useState(DEFAULT_HALL_OPTIONS);
  const [KITCHEN_OPTIONS, setKitchenOptions] = useState(DEFAULT_KITCHEN_OPTIONS);
  const [WEDDING_GROUNDS_PRICE, setWeddingGroundsPrice] = useState(DEFAULT_WEDDING_GROUNDS_PRICE);

  useEffect(() => {
    fetch("/api/rooms/prices")
      .then((r) => r.json())
      .then((data) => {
        if (data.types?.length > 0) {
          // Build a price lookup from DB results, keyed by slug
          const apiBySlug = new Map<string, { label: string; price: number; slug: string }>(
            data.types.map((t: { label: string; price: number; slug: string }) => [t.slug, t])
          );
          // Use DEFAULT order + labels, but take price from DB when available
          // This ensures Suite (Fan) always shows even if not yet in DB
          const merged = DEFAULT_ROOM_OPTIONS.map((def) => {
            const api = apiBySlug.get(def.slug);
            return api ? { ...def, price: api.price } : def;
          });
          setRoomOptions(merged);
        }
      })
      .catch(() => {});

    fetch("/api/settings/pricing")
      .then((r) => r.json())
      .then((data) => {
        if (data.halls?.length > 0) setHallOptions(data.halls);
        if (data.kitchen?.length > 0) setKitchenOptions(data.kitchen);
        if (typeof data.wedding_grounds === "number") setWeddingGroundsPrice(data.wedding_grounds);
      })
      .catch(() => {});
  }, []);

  const [selectedHalls, setSelectedHalls] = useState<Record<string, boolean>>({});
  const [hallDays, setHallDays] = useState(1);
  const [selectedKitchen, setSelectedKitchen] = useState("");
  const [kitchenDays, setKitchenDays] = useState(1);
  const [needsGrounds, setNeedsGrounds] = useState(false);

  const [roomQuantities, setRoomQuantities] = useState<Record<string, number>>({});

  const [showRoomBreakdown, setShowRoomBreakdown] = useState(false);
  const [showHallBreakdown, setShowHallBreakdown] = useState(false);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "",
    denomination: "", ageRange: "", relationship: "",
    altContactName: "", altContactRelationship: "", altContactPhone: "",
    idType: "", idNumber: "",
    fromDate: "", toDate: "", startTime: "", endTime: "",
    specialRequests: "",
  });

  const [availability, setAvailability] = useState<Record<string, number>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  useEffect(() => {
    if (!formData.fromDate || !formData.toDate) {
      setAvailability({});
      return;
    }
    setLoadingAvailability(true);
    fetch(`/api/rooms/availability?check_in=${formData.fromDate}&check_out=${formData.toDate}`)
      .then((res) => res.json())
      .then((data) => {
        const counts: Record<string, number> = {};
        ROOM_OPTIONS.forEach((r) => { counts[r.label] = 0; });
        (data.available || []).forEach((r: { type: string }) => {
          const typeMap: Record<string, string> = {
            "2_IN_1": "2 IN 1", "3_IN_1": "3 IN 1", "4_IN_1": "4 IN 1", "6_IN_1": "6 IN 1",
            "SUITE_FAN": "Suite (Fan)", "SUITE_AC": "Suite (AC)",
            "APARTMENT": "Holy Family Apartment",
          };
          const label = typeMap[r.type] || r.type;
          counts[label] = (counts[label] || 0) + 1;
        });
        setAvailability(counts);
      })
      .catch(() => setAvailability({}))
      .finally(() => setLoadingAvailability(false));
  }, [formData.fromDate, formData.toDate]);

  const handleTypeSelect = useCallback((type: "individual" | "group") => {
    setBookingType(type);
    setIsLodging("yes");
    if (roomParam) {
      const match = ROOM_OPTIONS.find((r) => r.slug === roomParam);
      if (match) {
        if (type === "individual") {
          setSelectedRoom(match.label);
        } else {
          setRoomQuantities((prev) => ({ ...prev, [match.label]: 1 }));
        }
      }
    }
    setShowTypePopup(false);
  }, [roomParam]);

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

  const today = todayStr();

  useEffect(() => {
    if (formData.fromDate && nights > 0) {
      const computed = addDays(formData.fromDate, nights);
      if (computed !== formData.toDate) {
        setFormData((prev) => ({ ...prev, toDate: computed }));
      }
    }
  }, [formData.fromDate, nights]);

  useEffect(() => {
    if (formData.fromDate && formData.toDate) {
      const computed = daysBetween(formData.fromDate, formData.toDate);
      if (computed !== nights && computed >= 1) {
        setNights(computed);
      }
    }
  }, [formData.toDate]);

  const updateField = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const toggleHall = (label: string) => {
    setSelectedHalls((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      setSubmitError("Please fill in your name, email, and phone number.");
      return;
    }
    if (!formData.fromDate || !formData.toDate) {
      setSubmitError("Please select your check-in and check-out dates.");
      return;
    }

    if (isLodging === "yes") {
      if (bookingType === "individual" && selectedRoom) {
        const avail = availability[selectedRoom];
        if (avail !== undefined && avail === 0) {
          setSubmitError(`Sorry, ${selectedRoom} rooms are fully booked for your selected dates. Please choose a different room type or contact us at ${CONTACT_NUMBERS[1]} for assistance.`);
          return;
        }
      } else if (bookingType === "group") {
        const fullRooms = ROOM_OPTIONS.filter((r) => (roomQuantities[r.label] || 0) > 0 && availability[r.label] === 0);
        if (fullRooms.length > 0) {
          setSubmitError(`Sorry, ${fullRooms.map((r) => r.label).join(", ")} rooms are fully booked for your selected dates. Please adjust your selection or contact us at ${CONTACT_NUMBERS[1]}.`);
          return;
        }
        const overbooked = ROOM_OPTIONS.filter((r) => {
          const qty = roomQuantities[r.label] || 0;
          const avail = availability[r.label];
          return qty > 0 && avail !== undefined && qty > avail;
        });
        if (overbooked.length > 0) {
          setSubmitError(`You've selected more rooms than available: ${overbooked.map((r) => `${r.label} (${availability[r.label]} available, ${roomQuantities[r.label]} selected)`).join(", ")}. Please adjust or contact us at ${CONTACT_NUMBERS[1]}.`);
          return;
        }
      }
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
            hall_days: activeHalls.length > 0 ? hallDays : 0,
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

  const activeHalls = HALL_OPTIONS.filter((h) => selectedHalls[h.label]);
  const hallsTotal = activeHalls.reduce((s, h) => s + h.price, 0) * hallDays;
  const kitchenOption = KITCHEN_OPTIONS.find((k) => k.label === selectedKitchen);
  const kitchenTotal = kitchenOption ? kitchenOption.price * kitchenDays : 0;
  const groundsPrice = needsGrounds ? WEDDING_GROUNDS_PRICE : 0;
  const hallPrice = hallsTotal + kitchenTotal + groundsPrice;

  const hallBreakdownLines = useMemo(() => {
    const lines: { label: string; calc: string; amount: number }[] = [];
    activeHalls.forEach((h) => {
      lines.push({
        label: h.label,
        calc: `GH₵${h.price} × ${hallDays} day${hallDays > 1 ? "s" : ""}`,
        amount: h.price * hallDays,
      });
    });
    if (kitchenOption) {
      lines.push({
        label: kitchenOption.label,
        calc: `GH₵${kitchenOption.price} × ${kitchenDays} day${kitchenDays > 1 ? "s" : ""}`,
        amount: kitchenOption.price * kitchenDays,
      });
    }
    if (needsGrounds) {
      lines.push({ label: "Wedding Grounds", calc: "Fixed rate", amount: WEDDING_GROUNDS_PRICE });
    }
    return lines;
  }, [activeHalls, hallDays, kitchenOption, kitchenDays, needsGrounds]);

  const totalAmount = roomPrice + hallPrice;
  const deposit = Math.ceil(totalAmount * 0.3);
  const balance = totalAmount - deposit;

  const toggleBtnClass = (active: boolean) =>
    `px-7 py-3 text-sm font-medium rounded-xl border transition-all duration-300 backdrop-blur-xl ${
      active
        ? "border-gold/40 bg-gold/[0.12] text-gold shadow-[0_4px_20px_rgba(212,175,55,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]"
        : "border-white/[0.1] bg-white/[0.04] text-warm-muted hover:border-gold/30 hover:text-warm-white hover:bg-white/[0.08] hover:shadow-[0_4px_15px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.06)] hover:scale-[1.02] active:scale-[0.97]"
    }`;

  return (
    <>
      {/* Booking Type Popup */}
      {showTypePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setShowTypePopup(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.15] bg-white/[0.07] backdrop-blur-3xl shadow-[0_8px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.12] via-white/[0.03] to-transparent pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gold/[0.03] to-transparent pointer-events-none" />
            <div className="relative p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl border border-gold/20 bg-gold/[0.08] backdrop-blur-sm flex items-center justify-center shadow-[0_4px_20px_rgba(212,175,55,0.1)]">
                <Users className="h-7 w-7 text-gold" />
              </div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-warm-white mb-2">
                How are you booking?
              </h2>
              <p className="text-warm-muted text-sm mb-8">
                {roomParam ? (
                  <>You selected <span className="text-gold font-medium">{ROOM_OPTIONS.find((r) => r.slug === roomParam)?.label || roomParam}</span>. Are you booking for yourself or a group?</>
                ) : (
                  "Are you booking for yourself or a group?"
                )}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleTypeSelect("individual")}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.05] backdrop-blur-xl p-7 transition-all duration-300 hover:border-gold/40 hover:bg-white/[0.1] hover:shadow-[0_8px_30px_rgba(212,175,55,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <User className="h-9 w-9 text-gold/60 mx-auto mb-3 group-hover:text-gold transition-colors duration-300" />
                    <p className="text-warm-white font-semibold text-sm mb-1">Individual</p>
                    <p className="text-warm-muted/70 text-xs">Booking for myself</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeSelect("group")}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.05] backdrop-blur-xl p-7 transition-all duration-300 hover:border-gold/40 hover:bg-white/[0.1] hover:shadow-[0_8px_30px_rgba(212,175,55,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <Users className="h-9 w-9 text-gold/60 mx-auto mb-3 group-hover:text-gold transition-colors duration-300" />
                    <p className="text-warm-white font-semibold text-sm mb-1">Group</p>
                    <p className="text-warm-muted/70 text-xs">Booking for a group</p>
                  </div>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowTypePopup(false)}
                className="mt-6 text-warm-muted/60 text-xs hover:text-warm-white transition-colors duration-200"
              >
                Skip &mdash; I&rsquo;ll choose below
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] overflow-hidden bg-luxury">
        <Image src={img(siteImages, "hero.booking")} alt="Book your stay at WPTC" fill className="object-cover" style={imgBlurStyle(siteBlurs, "hero.booking")} priority quality={85} />
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
                    {bookingType === "group" ? "Booker Name" : "Full Name"} <span className="text-red-400">*</span>
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
                {bookingType === "individual" && (
                  <div className="space-y-2">
                    <Label htmlFor="relationship" className={labelClass}>Relationship Status</Label>
                    <select id="relationship" value={formData.relationship} onChange={(e) => updateField("relationship", e.target.value)} className={selectClass}>
                      <option value="">Select status</option>
                      {RELATIONSHIP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Secondary Contact */}
            <SectionCard icon={Phone} title="Secondary Contact">
              <p className="text-xs text-warm-muted/60 mb-4 -mt-3">
                Someone we can reach in case the primary contact is unavailable.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="altContactName" className={labelClass}>Contact Name</Label>
                  <Input id="altContactName" placeholder="Full name" value={formData.altContactName} onChange={(e) => updateField("altContactName", e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altContactRelationship" className={labelClass}>Relationship</Label>
                  <Input id="altContactRelationship" placeholder="e.g. Spouse, Friend, Colleague" value={formData.altContactRelationship} onChange={(e) => updateField("altContactRelationship", e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altContactPhone" className={labelClass}>Phone Number</Label>
                  <Input id="altContactPhone" type="tel" placeholder="+233 XXX XXX XXX" value={formData.altContactPhone} onChange={(e) => updateField("altContactPhone", e.target.value)} className={inputClass} />
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

            {/* Stay Duration — moved before Lodging so nights drives the date range */}
            <SectionCard icon={Clock} title="Stay Duration">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="fromDate" className={labelClass}>Check-in Date <span className="text-red-400">*</span></Label>
                  <Input id="fromDate" type="date" min={today} value={formData.fromDate} onChange={(e) => updateField("fromDate", e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Number of Nights</Label>
                  <NumberStepper
                    value={nights}
                    onChange={(val) => {
                      setNights(val);
                      if (formData.fromDate) {
                        setFormData((prev) => ({ ...prev, toDate: addDays(prev.fromDate, val) }));
                      }
                    }}
                    min={1}
                    max={90}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toDate" className={labelClass}>Check-out Date <span className="text-red-400">*</span></Label>
                  <Input
                    id="toDate"
                    type="date"
                    min={formData.fromDate ? addDays(formData.fromDate, 1) : today}
                    value={formData.toDate}
                    onChange={(e) => updateField("toDate", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime" className={labelClass}>Arrival Time</Label>
                  <Input id="startTime" type="time" value={formData.startTime} onChange={(e) => updateField("startTime", e.target.value)} className={inputClass} />
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
                  {formData.fromDate && formData.toDate && (
                    <div className="flex flex-wrap gap-2 p-4 rounded-xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-xl">
                      {loadingAvailability ? (
                        <span className="text-xs text-warm-muted flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" />Checking availability...</span>
                      ) : Object.keys(availability).length > 0 ? (
                        ROOM_OPTIONS.map((r) => {
                          const count = availability[r.label] || 0;
                          return (
                            <span key={r.label} className={`text-[11px] px-2.5 py-1 rounded-full border ${count > 0 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-red-500/20 bg-red-500/10 text-red-400"}`}>
                              {r.label}: {count > 0 ? `${count} available` : "Full"}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-warm-muted">Select dates to check availability</span>
                      )}
                    </div>
                  )}

                  {bookingType === "individual" ? (
                    <div className="space-y-2">
                      <Label htmlFor="roomType" className={labelClass}>Room Type</Label>
                      <select id="roomType" value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} className={selectClass}>
                        <option value="">Select a room</option>
                        {ROOM_OPTIONS.map((r) => {
                          const count = availability[r.label];
                          return (
                            <option key={r.label} value={r.label} disabled={count === 0}>
                              {r.label} — GH₵{r.price}/night
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Label className={labelClass}>Room Quantities</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ROOM_OPTIONS.map((r) => {
                          const count = availability[r.label];
                          return (
                            <div key={r.label} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-xl hover:bg-white/[0.06] hover:border-white/[0.14] transition-all duration-300">
                              <div>
                                <p className="text-sm font-medium text-warm-white">{r.label}</p>
                                <p className="text-xs text-warm-muted">
                                  GH₵{r.price}/night
                                  {count !== undefined && (
                                    <span className={count > 0 ? " text-emerald-400" : " text-red-400"}>
                                      {" "}· {count > 0 ? `${count} available` : "Full"}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <NumberStepper
                                value={roomQuantities[r.label] || 0}
                                onChange={(val) => setRoomQuantities((prev) => ({ ...prev, [r.label]: val }))}
                                min={0}
                                max={count !== undefined ? count : 20}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            {/* Hall Usage — multi-select (group only) */}
            {bookingType === "group" && (
            <SectionCard icon={Church} title="Hall Usage">
              <p className="text-xs text-warm-muted/60 mb-4 -mt-3">
                Select one or more halls you need. Each hall is charged per day of use.
              </p>
              <div className="space-y-2 mb-5">
                {HALL_OPTIONS.map((h) => (
                  <label key={h.label} className={checkboxCardClass(!!selectedHalls[h.label])}>
                    <input
                      type="checkbox"
                      checked={!!selectedHalls[h.label]}
                      onChange={() => toggleHall(h.label)}
                      className="h-4 w-4 rounded border-gold/30 bg-luxury text-gold focus:ring-gold/30 shrink-0"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-warm-white">{h.label}</p>
                      <p className="text-xs text-warm-muted">GH₵{h.price}/day</p>
                    </div>
                  </label>
                ))}
              </div>

              {activeHalls.length > 0 && (
                <div className="space-y-2 mb-6">
                  <Label className={labelClass}>Days of Hall Usage</Label>
                  <NumberStepper value={hallDays} onChange={setHallDays} min={1} max={30} />
                </div>
              )}
            </SectionCard>

            )}

            {/* Kitchen & Dining — single select (group only) */}
            {bookingType === "group" && (
            <SectionCard icon={UtensilsCrossed} title="Kitchen & Dining">
              <p className="text-xs text-warm-muted/60 mb-4 -mt-3">
                Select one kitchen option based on your group size.
              </p>
              <div className="space-y-2 mb-5">
                {KITCHEN_OPTIONS.map((k) => (
                  <label key={k.label} className={checkboxCardClass(selectedKitchen === k.label)}>
                    <input
                      type="radio"
                      name="kitchen"
                      checked={selectedKitchen === k.label}
                      onChange={() => setSelectedKitchen(selectedKitchen === k.label ? "" : k.label)}
                      className="h-4 w-4 border-gold/30 bg-luxury text-gold focus:ring-gold/30 shrink-0"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-warm-white">{k.label}</p>
                      <p className="text-xs text-warm-muted">GH₵{k.price}/day</p>
                    </div>
                  </label>
                ))}
              </div>

              {selectedKitchen && (
                <div className="space-y-2 mb-6">
                  <Label className={labelClass}>Days of Kitchen Usage</Label>
                  <NumberStepper value={kitchenDays} onChange={setKitchenDays} min={1} max={30} />
                </div>
              )}
            </SectionCard>

            )}

            {/* Wedding Grounds (group only) */}
            {bookingType === "group" && (
            <SectionCard icon={TreePine} title="Grounds Usage">
              <label className={checkboxCardClass(needsGrounds)}>
                <input
                  type="checkbox"
                  checked={needsGrounds}
                  onChange={(e) => setNeedsGrounds(e.target.checked)}
                  className="h-4 w-4 rounded border-gold/30 bg-luxury text-gold focus:ring-gold/30 shrink-0"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-warm-white">Wedding Grounds</p>
                  <p className="text-xs text-warm-muted">GH₵{WEDDING_GROUNDS_PRICE.toLocaleString()} — flat rate</p>
                </div>
              </label>
            </SectionCard>

            )}

            {/* Special Requests */}
            <SectionCard icon={CalendarCheck} title="Special Requests">
              <div className="space-y-2">
                <Label htmlFor="specialRequests" className={labelClass}>Any special requirements or notes?</Label>
                <textarea
                  id="specialRequests"
                  rows={3}
                  value={formData.specialRequests}
                  onChange={(e) => updateField("specialRequests", e.target.value)}
                  placeholder="Dietary needs, accessibility requirements, event details..."
                  className={`w-full rounded-md px-3 py-2 text-sm resize-none ${inputClass}`}
                />
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

                {/* Hall / Kitchen / Grounds Amount */}
                <div>
                  <button
                    type="button"
                    onClick={() => hallBreakdownLines.length > 0 && setShowHallBreakdown(!showHallBreakdown)}
                    className="flex items-center justify-between w-full py-3 border-b border-dashed border-gold/10 group"
                  >
                    <span className="text-sm text-warm-muted flex items-center gap-1.5">
                      Halls / Kitchen / Grounds
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
