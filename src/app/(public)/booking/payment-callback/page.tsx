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
          <Loader2 className="h-16 w-16 animate-spin text-amber-500" />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-stone-800">
              Verifying Payment
            </h2>
            <p className="mt-2 text-stone-500">
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
          className="w-full max-w-md rounded-2xl border border-green-100 bg-white p-8 text-center shadow-lg"
        >
          {/* Animated check circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-50"
          >
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <CheckCircle className="h-14 w-14 text-green-500" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-stone-800">
              Payment Successful!
            </h2>
            <p className="mt-2 text-stone-500">
              Your booking has been confirmed
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 space-y-3 rounded-xl bg-stone-50 p-5 text-left"
          >
            {paymentData.booking_reference && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500">Booking Ref</span>
                  <span className="font-mono text-sm font-bold text-amber-700">
                    {paymentData.booking_reference}
                  </span>
                </div>
                <div className="h-px bg-stone-200" />
              </>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-500">Payment Ref</span>
              <span className="font-mono text-sm font-semibold text-stone-800">
                {paymentData.reference}
              </span>
            </div>
            <div className="h-px bg-stone-200" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-500">Amount Paid</span>
              <span className="text-lg font-bold text-green-600">
                GH&#x20B5;{paymentData.amount.toFixed(2)}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <Link href="/">
              <Button className="w-full bg-amber-600 text-white hover:bg-amber-700">
                Return to Home
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Failed state
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-lg"
      >
        {/* Animated error circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50"
        >
          <motion.div
            initial={{ rotate: -90 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <XCircle className="h-14 w-14 text-red-500" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-stone-800">
            Payment Failed
          </h2>
          <p className="mt-2 text-stone-500">
            We could not verify your payment. Please try again or contact
            support if the issue persists.
          </p>
        </motion.div>

        {reference && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 rounded-xl bg-stone-50 p-4"
          >
            <span className="text-sm text-stone-500">Reference: </span>
            <span className="font-mono text-sm text-stone-700">
              {reference}
            </span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex flex-col gap-3"
        >
          <Link href="/booking">
            <Button className="w-full bg-amber-600 text-white hover:bg-amber-700">
              Try Again
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">
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
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
