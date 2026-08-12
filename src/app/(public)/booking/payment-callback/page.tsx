"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const reference =
    searchParams.get("reference") || searchParams.get("trxref");
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading",
  );
  const [paymentData, setPaymentData] = useState<{
    amount: number;
    reference: string;
    booking_reference: string | null;
  } | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      return;
    }

    fetch(`/api/payments/verify?reference=${reference}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setStatus("success");
          setPaymentData({ amount: data.amount, reference: data.reference, booking_reference: data.booking_reference });
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
  }, [reference]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <Loader2 className="h-16 w-16 animate-spin text-gold" />
          <div className="text-center">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-warm-white">
              Verifying Payment
            </h2>
            <p className="mt-2 text-warm-muted">
              Please wait while we confirm your transaction...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (status === "success" && paymentData) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md border border-gold/15 bg-luxury-card p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-gold/20"
          >
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <CheckCircle className="h-12 w-12 text-gold" />
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-warm-white">
              Payment Successful!
            </h2>
            <p className="mt-2 text-warm-muted">Your booking has been confirmed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 space-y-3 border border-gold/10 bg-luxury p-5 text-left"
          >
            {paymentData.booking_reference && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-warm-muted">Booking Ref</span>
                  <span className="font-mono text-sm font-bold text-gold">
                    {paymentData.booking_reference}
                  </span>
                </div>
                <div className="h-px bg-gold/10" />
              </>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-warm-muted">Payment Ref</span>
              <span className="font-mono text-sm font-semibold text-warm-white">
                {paymentData.reference}
              </span>
            </div>
            <div className="h-px bg-gold/10" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-warm-muted">Amount Paid</span>
              <span className="text-lg font-bold text-gold">
                GH&#x20B5;{paymentData.amount.toFixed(2)}
              </span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8">
            <Link href="/">
              <Button className="w-full bg-gold text-luxury hover:bg-gold-bright font-semibold text-[11px] tracking-[0.1em] uppercase h-11">
                Return to Home
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md border border-red-500/20 bg-luxury-card p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-red-500/20"
        >
          <motion.div initial={{ rotate: -90 }} animate={{ rotate: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
            <XCircle className="h-12 w-12 text-red-400" />
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-warm-white">
            Payment Failed
          </h2>
          <p className="mt-2 text-warm-muted">
            We could not verify your payment. Please try again or contact
            support if the issue persists.
          </p>
        </motion.div>

        {reference && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 border border-gold/10 bg-luxury p-4"
          >
            <span className="text-sm text-warm-muted">Reference: </span>
            <span className="font-mono text-sm text-warm-white">{reference}</span>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8 flex flex-col gap-3">
          <Link href="/booking">
            <Button className="w-full bg-gold text-luxury hover:bg-gold-bright font-semibold text-[11px] tracking-[0.1em] uppercase h-11">
              Try Again
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full border-gold/30 text-gold hover:bg-gold/10 text-[11px] tracking-[0.1em] uppercase h-11">
              Return to Home
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-luxury">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
