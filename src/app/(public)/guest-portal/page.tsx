"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSiteImages, useSiteBlurs, img, imgBlurStyle } from "@/lib/use-site-images";
import { formatCurrency, formatDate } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, Loader2, CheckCircle, Clock, AlertCircle, CalendarCheck,
  CreditCard, MessageSquare, LogOut, BedDouble, ShieldCheck, ArrowLeft,
  RefreshCw, Bell, ChevronDown, ChevronUp,
} from "lucide-react";

interface BookingData {
  id: string;
  reference: string;
  check_in: string;
  check_out: string;
  nights: number;
  total_amount: number;
  paid_amount: number;
  balance: number;
  status: string;
  payment_status: string;
  booking_type: string;
  special_requests: string | null;
  created_at: string;
  guest: { full_name: string; phone: string; email: string | null };
  rooms: { room: { number: string; type: string; building: string } }[];
  payments: { amount: number; method: string; status: string; created_at: string; reference: string }[];
  complaints: { id: string; subject: string; status: string; category: string; created_at: string; resolution: string | null; resolved_at: string | null }[];
}

const STATUS_DISPLAY: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Pending", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: CheckCircle },
  CHECKED_IN: { label: "Checked In", color: "text-teal-400 bg-teal-500/10 border-teal-500/20", icon: BedDouble },
  CHECKED_OUT: { label: "Checked Out", color: "text-warm-muted bg-warm-muted/10 border-warm-muted/20", icon: LogOut },
  CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: AlertCircle },
};

const COMPLAINT_STATUS: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Open", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  RESOLVED: { label: "Resolved", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  CLOSED: { label: "Closed", color: "text-warm-muted bg-warm-muted/10 border-warm-muted/20" },
};

const inputClass = "bg-white/[0.04] border-white/[0.12] text-warm-white rounded-xl placeholder:text-warm-muted/40 focus-visible:ring-gold/30";
const labelClass = "text-warm-muted text-xs tracking-wide";

type Step = "phone" | "otp" | "dashboard";

export default function GuestPortalPage() {
  const siteImages = useSiteImages();
  const siteBlurs = useSiteBlurs();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpSending, setOtpSending] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const [showComplaint, setShowComplaint] = useState<string | null>(null);
  const [complaintSubject, setComplaintSubject] = useState("");
  const [complaintDesc, setComplaintDesc] = useState("");
  const [complaintCategory, setComplaintCategory] = useState("OTHER");
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  const handlePhoneSubmit = async () => {
    if (!phone || phone.replace(/\D/g, "").length < 9) {
      setError("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const loginRes = await fetch("/api/guest-portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error);

      setOtpSending(true);
      const otpRes = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: phone, purpose: "guest_login" }),
      });
      const otpData = await otpRes.json();
      if (!otpRes.ok) throw new Error(otpData.error);

      setStep("otp");
      setOtpCode(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setOtpSending(false);
    }
  };

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...otpCode];
    newCode[index] = value.slice(-1);
    setOtpCode(newCode);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...otpCode];
    for (let i = 0; i < text.length; i++) newCode[i] = text[i];
    setOtpCode(newCode);
    otpRefs.current[Math.min(text.length, 5)]?.focus();
  }

  const verifyAndLoad = useCallback(async () => {
    const code = otpCode.join("");
    if (code.length < 6) return;
    setLoading(true);
    setError("");

    try {
      const verifyRes = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: phone, code, purpose: "guest_login" }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error);

      await loadBookings();
      setStep("dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }, [otpCode, phone]);

  useEffect(() => {
    const code = otpCode.join("");
    if (code.length === 6 && step === "otp") verifyAndLoad();
  }, [otpCode, step, verifyAndLoad]);

  const loadBookings = useCallback(async () => {
    const res = await fetch(`/api/guest-portal/bookings?phone=${encodeURIComponent(phone)}`);
    const data = await res.json();
    if (data.bookings) {
      setBookings(data.bookings);
      if (data.bookings.length > 0 && data.bookings[0].guest) {
        setGuestName(data.bookings[0].guest.full_name);
      }
      if (data.bookings.length === 1) {
        setExpandedBooking(data.bookings[0].id);
      }
    }
    setLastRefresh(new Date());
  }, [phone]);

  useEffect(() => {
    if (step !== "dashboard") return;
    const interval = setInterval(() => loadBookings(), 30000);
    return () => clearInterval(interval);
  }, [step, loadBookings]);

  const handleSubmitComplaint = async (bookingId: string) => {
    if (!complaintSubject || !complaintDesc) return;
    setSubmittingComplaint(true);
    try {
      const booking = bookings.find((b) => b.id === bookingId);
      const res = await fetch("/api/guest-portal/complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: bookingId,
          guest_id: null,
          category: complaintCategory,
          subject: complaintSubject,
          description: complaintDesc,
          booking_reference: booking?.reference,
          guest_phone: phone,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit complaint");
      setComplaintSuccess(true);
      setComplaintSubject("");
      setComplaintDesc("");
      setTimeout(() => {
        setComplaintSuccess(false);
        setShowComplaint(null);
        loadBookings();
      }, 2000);
    } catch {
      setError("Failed to submit complaint. Please try again.");
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[280px] overflow-hidden bg-luxury">
        <Image src={img(siteImages, "hero.booking")} alt="Guest Portal" fill className="object-cover" style={imgBlurStyle(siteBlurs, "hero.booking")} priority quality={85} />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative h-full flex items-center justify-center text-center">
          <div>
            <div className="w-10 h-px bg-gold mx-auto mb-5" />
            <p className="text-gold/60 text-[11px] tracking-[0.2em] uppercase mb-3">Guest Portal</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-bold text-warm-white mb-3">
              {step === "dashboard" ? `Welcome, ${guestName}` : "Guest Portal"}
            </h1>
            <p className="text-warm-muted text-sm max-w-xl mx-auto">
              {step === "dashboard"
                ? "View your bookings, track payments, and get live updates."
                : "Enter your phone number to view your bookings."}
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 bg-luxury">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div key="phone" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-md mx-auto">
                <div className="border border-white/[0.12] bg-white/[0.05] backdrop-blur-2xl rounded-2xl p-6 md:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="text-center mb-6">
                    <div className="mx-auto mb-4 w-14 h-14 rounded-xl border border-gold/30 bg-gold/[0.08] flex items-center justify-center">
                      <Smartphone className="h-7 w-7 text-gold" />
                    </div>
                    <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-white">Sign In</h2>
                    <p className="text-sm text-warm-muted mt-1">Enter the phone number you booked with</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className={labelClass}>Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="024 725 8161"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handlePhoneSubmit()}
                        className={inputClass + " h-12 text-center text-lg tracking-wider font-mono"}
                      />
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 p-3 border border-red-500/30 bg-red-500/10 rounded-lg text-sm text-red-300">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}
                      </motion.div>
                    )}

                    <Button
                      onClick={handlePhoneSubmit}
                      disabled={loading}
                      className="w-full bg-gold text-luxury hover:bg-gold-bright font-semibold h-12 text-[11px] tracking-[0.1em] uppercase rounded-xl shadow-[0_4px_15px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.3)] transition-all duration-300"
                    >
                      {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Checking...</> : "Continue"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : step === "otp" ? (
              <motion.div key="otp" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-md mx-auto">
                <div className="border border-white/[0.12] bg-white/[0.05] backdrop-blur-2xl rounded-2xl p-6 md:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="text-center mb-6">
                    <div className="mx-auto mb-4 w-14 h-14 rounded-xl border border-gold/30 bg-gold/[0.08] flex items-center justify-center">
                      <ShieldCheck className="h-7 w-7 text-gold" />
                    </div>
                    <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-white">Enter Verification Code</h2>
                    <p className="text-sm text-warm-muted mt-1">
                      We sent a 6-digit code to <span className="text-gold">{phone}</span>
                    </p>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 border border-red-500/30 bg-red-500/10 rounded-lg px-4 py-3 text-sm text-red-300">
                      {error}
                    </motion.div>
                  )}

                  <div className="flex justify-center gap-2 mb-6" onPaste={handleOtpPaste}>
                    {otpCode.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-12 h-14 text-center text-2xl font-bold bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] rounded-xl text-warm-white focus:border-gold/50 focus:ring-1 focus:ring-gold/30 focus:outline-none transition-all"
                      />
                    ))}
                  </div>

                  {loading && (
                    <div className="flex justify-center mb-4">
                      <Loader2 className="h-5 w-5 animate-spin text-gold" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => { setStep("phone"); setError(""); }}
                      className="text-warm-muted hover:text-warm-white transition-colors flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3 w-3" />Change number
                    </button>
                    <button
                      onClick={handlePhoneSubmit}
                      disabled={otpSending}
                      className="text-gold/60 hover:text-gold transition-colors"
                    >
                      {otpSending ? "Sending..." : "Resend code"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="dashboard" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-3xl mx-auto space-y-5">
                {/* Top bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-gold/60" />
                    <span className="text-xs text-warm-muted">
                      Live updates every 30s {lastRefresh && `· Last: ${lastRefresh.toLocaleTimeString()}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadBookings()}
                      className="text-warm-muted hover:text-gold h-8 gap-1 text-xs"
                    >
                      <RefreshCw className="h-3 w-3" />Refresh
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setStep("phone"); setBookings([]); setPhone(""); }}
                      className="border-gold/30 text-gold hover:bg-gold/10 text-xs h-8"
                    >
                      <LogOut className="h-3 w-3 mr-1" />Exit
                    </Button>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-16">
                    <CalendarCheck className="h-12 w-12 text-warm-muted/30 mx-auto mb-4" />
                    <p className="text-warm-muted">No bookings found for this phone number.</p>
                  </div>
                ) : (
                  bookings.map((booking) => {
                    const isExpanded = expandedBooking === booking.id;
                    const s = STATUS_DISPLAY[booking.status];
                    const Icon = s?.icon || Clock;

                    return (
                      <motion.div
                        key={booking.id}
                        layout
                        className="border border-white/[0.1] bg-white/[0.04] backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]"
                      >
                        {/* Booking header — always visible */}
                        <button
                          onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                          className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                        >
                          <div className="flex items-center gap-4 text-left">
                            <div>
                              <p className="text-sm font-semibold text-warm-white">{booking.reference}</p>
                              <p className="text-xs text-warm-muted">
                                {formatDate(booking.check_in)} — {formatDate(booking.check_out)} · {booking.nights} night{booking.nights > 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`${s?.color || ""} border text-[10px]`}>
                              <Icon className="h-3 w-3 mr-1" />{s?.label || booking.status}
                            </Badge>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-warm-muted" /> : <ChevronDown className="h-4 w-4 text-warm-muted" />}
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 space-y-5 border-t border-white/[0.06]">
                                {/* Details grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
                                  <div><span className="text-warm-muted block text-[10px] uppercase tracking-wide">Check-in</span><p className="font-medium text-warm-white text-sm">{formatDate(booking.check_in)}</p></div>
                                  <div><span className="text-warm-muted block text-[10px] uppercase tracking-wide">Check-out</span><p className="font-medium text-warm-white text-sm">{formatDate(booking.check_out)}</p></div>
                                  <div><span className="text-warm-muted block text-[10px] uppercase tracking-wide">Type</span><p className="font-medium text-warm-white text-sm capitalize">{booking.booking_type}</p></div>
                                  <div><span className="text-warm-muted block text-[10px] uppercase tracking-wide">Nights</span><p className="font-medium text-warm-white text-sm">{booking.nights}</p></div>
                                </div>

                                {booking.rooms && booking.rooms.length > 0 && (
                                  <div>
                                    <p className="text-[10px] text-warm-muted uppercase tracking-wide mb-2">Assigned Rooms</p>
                                    <div className="flex flex-wrap gap-2">
                                      {booking.rooms.map((r, i) => (
                                        <span key={i} className="text-xs px-2.5 py-1 rounded-lg border border-gold/20 bg-gold/[0.06] text-gold">
                                          Room {r.room?.number} ({r.room?.type?.replace("_", " ")})
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {booking.special_requests && (
                                  <div className="p-3 bg-gold/[0.04] border border-gold/10 rounded-lg text-sm">
                                    <span className="text-warm-muted text-[10px] uppercase tracking-wide">Special Requests</span>
                                    <p className="text-warm-white mt-0.5">{booking.special_requests}</p>
                                  </div>
                                )}

                                {/* Payment */}
                                <div>
                                  <p className="text-sm font-semibold text-warm-white flex items-center gap-2 mb-3">
                                    <CreditCard className="h-4 w-4 text-gold/60" />Payment
                                  </p>
                                  <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div className="text-center p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                                      <p className="text-[10px] text-warm-muted uppercase">Total</p>
                                      <p className="text-base font-bold text-warm-white">{formatCurrency(Number(booking.total_amount))}</p>
                                    </div>
                                    <div className="text-center p-3 bg-gold/[0.04] border border-gold/15 rounded-xl">
                                      <p className="text-[10px] text-warm-muted uppercase">Paid</p>
                                      <p className="text-base font-bold text-gold">{formatCurrency(Number(booking.paid_amount))}</p>
                                    </div>
                                    <div className="text-center p-3 bg-amber-500/[0.04] border border-amber-500/15 rounded-xl">
                                      <p className="text-[10px] text-warm-muted uppercase">Balance</p>
                                      <p className="text-base font-bold text-amber-400">{formatCurrency(Number(booking.balance))}</p>
                                    </div>
                                  </div>

                                  {booking.payments.length > 0 && (
                                    <div className="border border-white/[0.08] rounded-xl overflow-hidden">
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr className="bg-white/[0.03] border-b border-white/[0.06]">
                                            <th className="text-left p-2.5 font-medium text-warm-muted text-[10px] uppercase">Date</th>
                                            <th className="text-left p-2.5 font-medium text-warm-muted text-[10px] uppercase">Method</th>
                                            <th className="text-left p-2.5 font-medium text-warm-muted text-[10px] uppercase">Amount</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {booking.payments.map((p, i) => (
                                            <tr key={i} className="border-b border-white/[0.04] last:border-0">
                                              <td className="p-2.5 text-warm-white/80 text-xs">{formatDate(p.created_at)}</td>
                                              <td className="p-2.5 text-warm-white/80 text-xs">{p.method}</td>
                                              <td className="p-2.5 font-semibold text-warm-white text-xs">{formatCurrency(Number(p.amount))}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>

                                {/* Complaints */}
                                {booking.complaints && booking.complaints.length > 0 && (
                                  <div>
                                    <p className="text-sm font-semibold text-warm-white flex items-center gap-2 mb-3">
                                      <MessageSquare className="h-4 w-4 text-blue-400/60" />Your Complaints
                                    </p>
                                    <div className="space-y-2">
                                      {booking.complaints.map((c) => {
                                        const cs = COMPLAINT_STATUS[c.status] || COMPLAINT_STATUS.OPEN;
                                        return (
                                          <div key={c.id} className="p-3 border border-white/[0.08] rounded-xl bg-white/[0.02]">
                                            <div className="flex items-center justify-between mb-1">
                                              <p className="text-sm font-medium text-warm-white">{c.subject}</p>
                                              <Badge className={`${cs.color} border text-[10px]`}>{cs.label}</Badge>
                                            </div>
                                            <p className="text-xs text-warm-muted">{c.category} · {formatDate(c.created_at)}</p>
                                            {c.resolution && (
                                              <div className="mt-2 p-2 bg-emerald-500/[0.05] border border-emerald-500/15 rounded-lg">
                                                <p className="text-xs text-emerald-400">Resolution: {c.resolution}</p>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Lodge complaint */}
                                <div>
                                  {complaintSuccess && showComplaint === booking.id ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 bg-gold/[0.05] border border-gold/15 rounded-xl">
                                      <CheckCircle className="h-5 w-5 text-gold" />
                                      <div>
                                        <p className="font-medium text-warm-white text-sm">Complaint submitted!</p>
                                        <p className="text-xs text-warm-muted">Our team will review and address your concern.</p>
                                      </div>
                                    </motion.div>
                                  ) : showComplaint === booking.id ? (
                                    <div className="space-y-3 p-4 border border-white/[0.08] rounded-xl bg-white/[0.02]">
                                      <div className="space-y-1.5">
                                        <Label className={labelClass}>Category</Label>
                                        <select value={complaintCategory} onChange={(e) => setComplaintCategory(e.target.value)}
                                          className="w-full h-9 rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 text-sm text-warm-white focus:outline-none focus:ring-1 focus:ring-gold/30">
                                          <option value="NOISE">Noise</option>
                                          <option value="CLEANLINESS">Cleanliness</option>
                                          <option value="MAINTENANCE">Maintenance</option>
                                          <option value="SERVICE">Service</option>
                                          <option value="FOOD">Food</option>
                                          <option value="OTHER">Other</option>
                                        </select>
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className={labelClass}>Subject</Label>
                                        <Input value={complaintSubject} onChange={(e) => setComplaintSubject(e.target.value)} placeholder="Brief subject" className={inputClass} />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className={labelClass}>Description</Label>
                                        <Textarea value={complaintDesc} onChange={(e) => setComplaintDesc(e.target.value)} placeholder="Describe your concern" rows={3} className={inputClass + " resize-none"} />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setShowComplaint(null)} className="border-white/[0.12] text-warm-muted hover:text-warm-white rounded-lg">Cancel</Button>
                                        <Button size="sm" onClick={() => handleSubmitComplaint(booking.id)} disabled={submittingComplaint || !complaintSubject || !complaintDesc}
                                          className="bg-gold text-luxury hover:bg-gold-bright rounded-lg">
                                          {submittingComplaint ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />Submitting...</> : "Submit"}
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => { setShowComplaint(booking.id); setComplaintSuccess(false); }}
                                      className="border-white/[0.12] text-warm-muted hover:text-warm-white hover:border-gold/30 rounded-lg gap-1.5"
                                    >
                                      <MessageSquare className="h-3.5 w-3.5" />Lodge a Complaint
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
