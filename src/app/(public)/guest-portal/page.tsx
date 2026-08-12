"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { IMAGES } from "@/lib/images";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Search,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  LogOut,
  BedDouble,
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
  payments: { amount: number; method: string; status: string; created_at: string; reference: string }[];
}

const STATUS_DISPLAY: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Pending", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: CheckCircle },
  CHECKED_IN: { label: "Checked In", color: "text-teal-400 bg-teal-500/10 border-teal-500/20", icon: BedDouble },
  CHECKED_OUT: { label: "Checked Out", color: "text-warm-muted bg-warm-muted/10 border-warm-muted/20", icon: LogOut },
  CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: AlertCircle },
};

const inputClass = "bg-luxury border-gold/15 text-warm-white placeholder:text-warm-muted/40 focus-visible:ring-gold/30";
const labelClass = "text-warm-muted text-xs tracking-wide";

export default function GuestPortalPage() {
  const [step, setStep] = useState<"lookup" | "dashboard">("lookup");
  const [lookupRef, setLookupRef] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<BookingData | null>(null);

  const [showComplaint, setShowComplaint] = useState(false);
  const [complaintSubject, setComplaintSubject] = useState("");
  const [complaintDesc, setComplaintDesc] = useState("");
  const [complaintCategory, setComplaintCategory] = useState("OTHER");
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  const handleLookup = async () => {
    if (!lookupRef || !lookupPhone) {
      setError("Please enter both your booking reference and phone number.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/guest-portal/lookup?reference=${encodeURIComponent(lookupRef)}&phone=${encodeURIComponent(lookupPhone)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking not found");
      setBooking(data.booking);
      setStep("dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComplaint = async () => {
    if (!complaintSubject || !complaintDesc) return;
    setSubmittingComplaint(true);
    try {
      const res = await fetch("/api/guest-portal/complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: booking?.id,
          guest_id: null,
          category: complaintCategory,
          subject: complaintSubject,
          description: complaintDesc,
          booking_reference: booking?.reference,
          guest_phone: lookupPhone,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit complaint");
      setComplaintSuccess(true);
      setComplaintSubject("");
      setComplaintDesc("");
    } catch {
      setError("Failed to submit complaint. Please try again.");
    } finally {
      setSubmittingComplaint(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] overflow-hidden bg-luxury">
        <Image src={IMAGES.hero.booking} alt="Guest Portal" fill className="object-cover" priority quality={85} />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative h-full flex items-center justify-center text-center">
          <div>
            <div className="w-10 h-px bg-gold mx-auto mb-5" />
            <p className="text-gold/60 text-[11px] tracking-[0.2em] uppercase mb-3">Guest Portal</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white mb-4">
              View Your Booking
            </h1>
            <p className="text-warm-muted text-base max-w-xl mx-auto">
              Check your booking status, view payment history, and lodge any complaints.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-luxury">
        <div className="container mx-auto px-4">
          {step === "lookup" ? (
            <div className="max-w-md mx-auto bg-luxury-card border border-gold/10 overflow-hidden">
              <div className="h-px bg-gradient-to-r from-gold/30 via-gold/10 to-transparent" />
              <div className="p-6 md:p-8 space-y-5">
                <div className="text-center mb-2">
                  <Search className="h-8 w-8 text-gold/60 mx-auto mb-3" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-white">Find Your Booking</h2>
                  <p className="text-sm text-warm-muted mt-1">Enter your booking reference and phone number</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ref" className={labelClass}>Booking Reference</Label>
                  <Input id="ref" placeholder="e.g. WPTC-XXXXXX" value={lookupRef} onChange={(e) => setLookupRef(e.target.value.toUpperCase())}
                    className={inputClass + " font-mono text-center text-lg tracking-wider"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className={labelClass}>Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+233 XXX XXX XXX" value={lookupPhone} onChange={(e) => setLookupPhone(e.target.value)}
                    className={inputClass} />
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 border border-red-500/30 bg-red-500/10 text-sm text-red-300">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}
                  </div>
                )}

                <Button onClick={handleLookup} disabled={loading} className="w-full bg-gold text-luxury hover:bg-gold-bright font-semibold h-11 text-[11px] tracking-[0.1em] uppercase">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Looking up...</> : "View My Booking"}
                </Button>
              </div>
            </div>
          ) : booking ? (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-warm-white">Welcome, {booking.guest.full_name}</h2>
                  <p className="text-warm-muted text-sm">Booking {booking.reference}</p>
                </div>
                <Button variant="outline" onClick={() => { setStep("lookup"); setBooking(null); }} className="border-gold/30 text-gold hover:bg-gold/10 text-[11px] tracking-[0.1em] uppercase">
                  <LogOut className="h-4 w-4 mr-1.5" />Exit
                </Button>
              </div>

              {/* Booking Status Card */}
              <div className="bg-luxury-card border border-gold/10 overflow-hidden">
                <div className="h-px bg-gradient-to-r from-gold/30 via-gold/10 to-transparent" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-warm-white flex items-center gap-2">
                      <CalendarCheck className="h-5 w-5 text-gold/60" />Booking Details
                    </h3>
                    {(() => {
                      const s = STATUS_DISPLAY[booking.status];
                      const Icon = s?.icon || Clock;
                      return (
                        <Badge className={`${s?.color || ""} border`}>
                          <Icon className="h-3 w-3 mr-1" />{s?.label || booking.status}
                        </Badge>
                      );
                    })()}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-warm-muted block text-xs">Check-in</span><p className="font-medium text-warm-white">{formatDate(booking.check_in)}</p></div>
                    <div><span className="text-warm-muted block text-xs">Check-out</span><p className="font-medium text-warm-white">{formatDate(booking.check_out)}</p></div>
                    <div><span className="text-warm-muted block text-xs">Nights</span><p className="font-medium text-warm-white">{booking.nights}</p></div>
                    <div><span className="text-warm-muted block text-xs">Type</span><p className="font-medium text-warm-white">{booking.booking_type}</p></div>
                  </div>
                  {booking.special_requests && (
                    <div className="mt-4 p-3 bg-gold/5 border border-gold/10 text-sm">
                      <span className="text-warm-muted text-xs">Special Requests:</span>
                      <p className="text-warm-white mt-0.5">{booking.special_requests}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-luxury-card border border-gold/10 overflow-hidden">
                <div className="h-px bg-gradient-to-r from-gold/30 via-gold/10 to-transparent" />
                <div className="p-6">
                  <h3 className="font-semibold text-warm-white flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-gold/60" />Payment Summary
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-luxury border border-gold/10">
                      <p className="text-[10px] text-warm-muted uppercase tracking-wide">Total</p>
                      <p className="text-lg font-bold text-warm-white">{formatCurrency(Number(booking.total_amount))}</p>
                    </div>
                    <div className="text-center p-3 bg-gold/5 border border-gold/15">
                      <p className="text-[10px] text-warm-muted uppercase tracking-wide">Paid</p>
                      <p className="text-lg font-bold text-gold">{formatCurrency(Number(booking.paid_amount))}</p>
                    </div>
                    <div className="text-center p-3 bg-amber-500/5 border border-amber-500/15">
                      <p className="text-[10px] text-warm-muted uppercase tracking-wide">Balance</p>
                      <p className="text-lg font-bold text-amber-400">{formatCurrency(Number(booking.balance))}</p>
                    </div>
                  </div>

                  {booking.payments && booking.payments.length > 0 && (
                    <div className="border border-gold/10 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead><tr className="bg-luxury border-b border-gold/10">
                          <th className="text-left p-2.5 font-medium text-warm-muted text-xs">Date</th>
                          <th className="text-left p-2.5 font-medium text-warm-muted text-xs">Method</th>
                          <th className="text-left p-2.5 font-medium text-warm-muted text-xs">Amount</th>
                          <th className="text-left p-2.5 font-medium text-warm-muted text-xs">Status</th>
                        </tr></thead>
                        <tbody>
                          {booking.payments.map((p, i) => (
                            <tr key={i} className="border-b border-gold/5 last:border-0">
                              <td className="p-2.5 text-warm-white/80">{formatDate(p.created_at)}</td>
                              <td className="p-2.5 text-warm-white/80">{p.method}</td>
                              <td className="p-2.5 font-semibold text-warm-white">{formatCurrency(Number(p.amount))}</td>
                              <td className="p-2.5">
                                <Badge className={p.status === "COMPLETED" ? "bg-gold/10 text-gold border-gold/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}>
                                  {p.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Lodge Complaint */}
              <div className="bg-luxury-card border border-gold/10 overflow-hidden">
                <div className="h-px bg-gradient-to-r from-blue-500/30 via-blue-500/10 to-transparent" />
                <div className="p-6">
                  <h3 className="font-semibold text-warm-white flex items-center gap-2 mb-4">
                    <MessageSquare className="h-5 w-5 text-blue-400/60" />Lodge a Complaint
                  </h3>

                  {complaintSuccess ? (
                    <div className="flex items-center gap-3 p-4 bg-gold/5 border border-gold/15">
                      <CheckCircle className="h-5 w-5 text-gold" />
                      <div>
                        <p className="font-medium text-warm-white">Complaint submitted successfully!</p>
                        <p className="text-sm text-warm-muted">Our team will review and address your concern.</p>
                      </div>
                    </div>
                  ) : showComplaint ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className={labelClass}>Category</Label>
                        <select value={complaintCategory} onChange={(e) => setComplaintCategory(e.target.value)}
                          className="w-full h-9 rounded-md border border-gold/15 bg-luxury px-3 text-sm text-warm-white">
                          <option value="NOISE">Noise</option>
                          <option value="CLEANLINESS">Cleanliness</option>
                          <option value="MAINTENANCE">Maintenance</option>
                          <option value="SERVICE">Service</option>
                          <option value="FOOD">Food</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className={labelClass}>Subject</Label>
                        <Input value={complaintSubject} onChange={(e) => setComplaintSubject(e.target.value)} placeholder="Brief subject" className={inputClass} />
                      </div>
                      <div className="space-y-2">
                        <Label className={labelClass}>Description</Label>
                        <Textarea value={complaintDesc} onChange={(e) => setComplaintDesc(e.target.value)} placeholder="Describe your concern in detail" rows={4} className={inputClass + " resize-none"} />
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setShowComplaint(false)} className="border-gold/30 text-warm-muted hover:text-warm-white">Cancel</Button>
                        <Button onClick={handleSubmitComplaint} disabled={submittingComplaint || !complaintSubject || !complaintDesc} className="bg-gold text-luxury hover:bg-gold-bright font-semibold">
                          {submittingComplaint ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Submitting...</> : "Submit Complaint"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => setShowComplaint(true)} className="w-full border-gold/20 text-warm-muted hover:text-warm-white hover:border-gold/30">
                      <MessageSquare className="h-4 w-4 mr-2" />Lodge a Complaint
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
