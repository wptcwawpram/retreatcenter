import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

function serviceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

/**
 * POST /api/bookings/recheck-payment { booking_id }
 * Asks Paystack (church account) whether this booking's payment actually
 * succeeded. Catches the "guest paid but a missed webhook left the booking
 * unpaid" case. If a success is found and not yet recorded, it records the
 * payment + finance income and updates the booking.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey) return NextResponse.json({ error: "Paystack not configured" }, { status: 400 });

    const { booking_id } = await request.json();
    if (!booking_id) return NextResponse.json({ error: "booking_id is required" }, { status: 400 });

    const supabase = serviceClient();
    const { data: booking } = await supabase
      .from("bookings")
      .select("*, guest:guests(full_name)")
      .eq("id", booking_id)
      .single();
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const ref = booking.payment_reference;
    if (!ref) return NextResponse.json({ error: "No online payment reference on this booking (nothing to re-check)." }, { status: 400 });

    const vr = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`, {
      headers: { Authorization: `Bearer ${paystackKey}` },
    });
    const vd = await vr.json();
    const status = vd?.data?.status;

    if (!vr.ok || !vd.status || status !== "success") {
      return NextResponse.json({ success: true, paid: false, status: status || "not found",
        message: status === "abandoned" ? "Payment was not completed (abandoned)."
          : status === "failed" ? "Payment failed."
          : "No successful payment found for this booking yet." });
    }

    const amountPaid = Number(vd.data.amount || 0) / 100;

    // Already recorded?
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("booking_id", booking_id)
      .eq("reference", ref)
      .maybeSingle();

    if (!existing && amountPaid > 0) {
      await supabase.from("payments").insert({
        booking_id, amount: amountPaid, method: "PAYSTACK", status: "COMPLETED",
        reference: ref, paystack_reference: ref, notes: "Reconciled via re-check", recorded_by: user.id,
      });
      await supabase.from("finance_records").insert({
        type: "INCOME", category: "Booking Payment",
        description: `Paystack payment for booking ${booking.reference} (reconciled)`,
        amount: amountPaid, date: new Date().toISOString().split("T")[0],
        booking_id, reference: booking.reference, payment_method: "PAYSTACK", recorded_by: user.id,
      }).then(() => {}, () => {});
    }

    // Recompute booking from all completed payments
    const { data: pays } = await supabase.from("payments").select("amount, status").eq("booking_id", booking_id);
    const paid = (pays || []).filter((p) => (p.status || "COMPLETED") === "COMPLETED").reduce((s, p) => s + Number(p.amount), 0);
    const total = Number(booking.total_amount) || 0;
    const balance = Math.max(0, total - paid);
    const payStatus = paid >= total && total > 0 ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID";
    await supabase.from("bookings").update({ paid_amount: paid, balance, payment_status: payStatus }).eq("id", booking_id);

    return NextResponse.json({ success: true, paid: true, amount: amountPaid, newPaid: paid, payStatus });
  } catch (error) {
    console.error("Re-check payment error:", error);
    return NextResponse.json({ error: "Failed to re-check payment" }, { status: 500 });
  }
}
