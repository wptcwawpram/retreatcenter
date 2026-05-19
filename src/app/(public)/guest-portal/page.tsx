"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  PENDING: { label: "Pending", color: "text-amber-700 bg-amber-50 border-amber-200", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "text-blue-700 bg-blue-50 border-blue-200", icon: CheckCircle },
  CHECKED_IN: { label: "Checked In", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: BedDouble },
  CHECKED_OUT: { label: "Checked Out", color: "text-gray-700 bg-gray-50 border-gray-200", icon: LogOut },
  CANCELLED: { label: "Cancelled", color: "text-red-700 bg-red-50 border-red-200", icon: AlertCircle },
};

export default function GuestPortalPage() {
  const [step, setStep] = useState<"lookup" | "dashboard">("lookup");
  const [lookupRef, setLookupRef] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<BookingData | null>(null);

  // Complaint form
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
          guest_id: null, // Will be resolved from booking
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
      <section className="relative text-white py-16 md:py-20 overflow-hidden">
        <Image src={IMAGES.hero.booking} alt="Guest Portal" fill className="object-cover" priority quality={85} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-amber-950/30" />
        <div className="relative container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 text-amber-200 border-amber-400/30 bg-white/10 px-4 py-1 backdrop-blur-sm">
            <CalendarCheck className="h-3.5 w-3.5 mr-1" />
            Guest Portal
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            View Your{" "}
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">Booking</span>
          </h1>
          <p className="text-white/80 max-w-xl mx-auto">
            Check your booking status, view payment history, and lodge any complaints.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gradient-to-b from-amber-50/30 to-white">
        <div className="container mx-auto px-4">
          {step === "lookup" ? (
            /* ─── Lookup Form ─── */
            <Card className="max-w-md mx-auto border-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400" />
              <CardContent className="p-6 md:p-8 space-y-5">
                <div className="text-center mb-2">
                  <Search className="h-10 w-10 text-amber-600 mx-auto mb-3" />
                  <h2 className="text-xl font-bold">Find Your Booking</h2>
                  <p className="text-sm text-muted-foreground mt-1">Enter your booking reference and phone number</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ref">Booking Reference</Label>
                  <Input id="ref" placeholder="e.g. WPTC-XXXXXX" value={lookupRef} onChange={(e) => setLookupRef(e.target.value.toUpperCase())}
                    className="border-gray-200 focus-visible:ring-amber-500 font-mono text-center text-lg tracking-wider" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+233 XXX XXX XXX" value={lookupPhone} onChange={(e) => setLookupPhone(e.target.value)}
                    className="border-gray-200 focus-visible:ring-amber-500" />
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}
                  </div>
                )}

                <Button onClick={handleLookup} disabled={loading} className="w-full bg-amber-700 hover:bg-amber-800 text-white h-11">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Looking up...</> : "View My Booking"}
                </Button>
              </CardContent>
            </Card>
          ) : booking ? (
            /* ─── Guest Dashboard ─── */
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Welcome */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Welcome, {booking.guest.full_name}</h2>
                  <p className="text-muted-foreground">Booking {booking.reference}</p>
                </div>
                <Button variant="outline" onClick={() => { setStep("lookup"); setBooking(null); }}>
                  <LogOut className="h-4 w-4 mr-1.5" />Exit
                </Button>
              </div>

              {/* Booking Status Card */}
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <CalendarCheck className="h-5 w-5 text-amber-700" />Booking Details
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
                    <div><span className="text-muted-foreground block">Check-in</span><p className="font-medium">{formatDate(booking.check_in)}</p></div>
                    <div><span className="text-muted-foreground block">Check-out</span><p className="font-medium">{formatDate(booking.check_out)}</p></div>
                    <div><span className="text-muted-foreground block">Nights</span><p className="font-medium">{booking.nights}</p></div>
                    <div><span className="text-muted-foreground block">Type</span><p className="font-medium">{booking.booking_type}</p></div>
                  </div>
                  {booking.special_requests && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm">
                      <span className="text-muted-foreground">Special Requests:</span>
                      <p>{booking.special_requests}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400" />
                <CardContent className="p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-emerald-700" />Payment Summary
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-lg font-bold">{formatCurrency(Number(booking.total_amount))}</p>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Paid</p>
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(Number(booking.paid_amount))}</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className="text-lg font-bold text-amber-600">{formatCurrency(Number(booking.balance))}</p>
                    </div>
                  </div>

                  {/* Payment history */}
                  {booking.payments && booking.payments.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead><tr className="bg-muted/50 border-b">
                          <th className="text-left p-2.5 font-medium">Date</th>
                          <th className="text-left p-2.5 font-medium">Method</th>
                          <th className="text-left p-2.5 font-medium">Amount</th>
                          <th className="text-left p-2.5 font-medium">Status</th>
                        </tr></thead>
                        <tbody>
                          {booking.payments.map((p, i) => (
                            <tr key={i} className="border-b last:border-0">
                              <td className="p-2.5">{formatDate(p.created_at)}</td>
                              <td className="p-2.5">{p.method}</td>
                              <td className="p-2.5 font-semibold">{formatCurrency(Number(p.amount))}</td>
                              <td className="p-2.5">
                                <Badge className={p.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                                  {p.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lodge Complaint */}
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400" />
                <CardContent className="p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <MessageSquare className="h-5 w-5 text-blue-700" />Lodge a Complaint
                  </h3>

                  {complaintSuccess ? (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="font-medium text-emerald-800">Complaint submitted successfully!</p>
                        <p className="text-sm text-emerald-600">Our team will review and address your concern.</p>
                      </div>
                    </div>
                  ) : showComplaint ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <select value={complaintCategory} onChange={(e) => setComplaintCategory(e.target.value)}
                          className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm">
                          <option value="NOISE">Noise</option>
                          <option value="CLEANLINESS">Cleanliness</option>
                          <option value="MAINTENANCE">Maintenance</option>
                          <option value="SERVICE">Service</option>
                          <option value="FOOD">Food</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input value={complaintSubject} onChange={(e) => setComplaintSubject(e.target.value)} placeholder="Brief subject" />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={complaintDesc} onChange={(e) => setComplaintDesc(e.target.value)} placeholder="Describe your concern in detail" rows={4} />
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setShowComplaint(false)}>Cancel</Button>
                        <Button onClick={handleSubmitComplaint} disabled={submittingComplaint || !complaintSubject || !complaintDesc}>
                          {submittingComplaint ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Submit Complaint
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => setShowComplaint(true)} className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />Lodge a Complaint
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
