"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { IMAGES } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Church, Loader2, Eye, EyeOff, ShieldCheck, Mail, Smartphone,
  Check, X, KeyRound, ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PASSWORD_RULES = [
  { label: "8 or more characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /\d/.test(p) },
  { label: "Symbol (!@#$...)", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

type Step = "login" | "2fa" | "loading" | "forgot" | "reset-sent";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const [step, setStep] = useState<Step>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [userId, setUserId] = useState("");
  const [otpMethod, setOtpMethod] = useState<"sms" | "email">("sms");
  const [otpMasked, setOtpMasked] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpSending, setOtpSending] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? "Invalid email or password. Please try again."
            : authError.message,
        );
        return;
      }

      if (data.user) {
        setUserId(data.user.id);
        await sendOTP(data.user.id, "sms");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function sendOTP(uid: string, method: "sms" | "email") {
    setOtpSending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: uid, purpose: "admin_2fa", method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOtpMasked(data.masked);
      setOtpMethod(data.channel);
      setStep("2fa");
      setOtpCode(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification code");
    } finally {
      setOtpSending(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...otpCode];
    newCode[index] = value.slice(-1);
    setOtpCode(newCode);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
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

  async function verifyOTP() {
    const code = otpCode.join("");
    if (code.length < 6) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: userId, code, purpose: "admin_2fa" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStep("loading");
      await new Promise((r) => setTimeout(r, 1500));
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const code = otpCode.join("");
    if (code.length === 6 && step === "2fa") verifyOTP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpCode]);

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setStep("reset-sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3 } },
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={IMAGES.hero.home}
          alt="Warriors Prayer Tower Complex"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />
      </div>

      <AnimatePresence mode="wait">
        {step === "loading" ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center gap-6"
          >
            <motion.div
              className="w-20 h-20 rounded-2xl border border-gold/30 bg-luxury-card/80 backdrop-blur-xl flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1], borderColor: ["rgba(212,175,55,0.3)", "rgba(212,175,55,0.6)", "rgba(212,175,55,0.3)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Church className="h-9 w-9 text-gold" />
            </motion.div>
            <div className="text-center">
              <motion.div
                className="flex items-center gap-2 text-gold text-sm font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading Dashboard...
              </motion.div>
              <motion.div
                className="h-1 bg-gold/20 rounded-full mt-4 w-48 overflow-hidden"
              >
                <motion.div
                  className="h-full bg-gold rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
          </motion.div>
        ) : step === "2fa" ? (
          <motion.div
            key="2fa"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 mx-4 w-full max-w-md"
          >
            <div className="border border-white/[0.12] bg-white/[0.05] backdrop-blur-2xl rounded-2xl p-8 shadow-[0_8px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-gold/30 bg-gold/[0.08]">
                  <ShieldCheck className="h-7 w-7 text-gold" />
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-white">
                  Two-Factor Authentication
                </h2>
                <p className="mt-2 text-sm text-warm-muted">
                  We sent a 6-digit code to{" "}
                  <span className="text-gold font-medium">{otpMasked}</span>
                  {" "}via {otpMethod === "sms" ? "SMS" : "email"}
                </p>
              </div>

              {error && (
                <div className="mb-4 border border-red-500/30 bg-red-500/10 rounded-lg px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
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
                  onClick={() => sendOTP(userId, otpMethod === "sms" ? "email" : "sms")}
                  disabled={otpSending}
                  className="text-warm-muted hover:text-gold transition-colors flex items-center gap-1"
                >
                  {otpMethod === "sms" ? <Mail className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                  Send via {otpMethod === "sms" ? "email" : "SMS"} instead
                </button>
                <button
                  onClick={() => sendOTP(userId, otpMethod)}
                  disabled={otpSending}
                  className="text-gold/60 hover:text-gold transition-colors"
                >
                  {otpSending ? "Sending..." : "Resend code"}
                </button>
              </div>

              <button
                onClick={() => { setStep("login"); setError(null); }}
                className="mt-4 w-full text-center text-xs text-warm-muted/60 hover:text-warm-white transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />Back to login
              </button>
            </div>
          </motion.div>
        ) : step === "forgot" || step === "reset-sent" ? (
          <motion.div
            key="forgot"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 mx-4 w-full max-w-md"
          >
            <div className="border border-white/[0.12] bg-white/[0.05] backdrop-blur-2xl rounded-2xl p-8 shadow-[0_8px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-gold/30 bg-gold/[0.08]">
                  <KeyRound className="h-7 w-7 text-gold" />
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-white">
                  {step === "reset-sent" ? "Check Your Email" : "Reset Password"}
                </h2>
              </div>

              {step === "reset-sent" ? (
                <div className="text-center space-y-4">
                  <p className="text-warm-muted text-sm">
                    We&rsquo;ve sent a password reset link to <span className="text-gold">{forgotEmail}</span>.
                    Check your inbox and follow the link.
                  </p>
                  <Button
                    onClick={() => { setStep("login"); setError(null); }}
                    className="w-full bg-gold text-luxury hover:bg-gold-bright font-semibold h-11 text-[11px] tracking-[0.1em] uppercase rounded-xl"
                  >
                    Back to Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-warm-muted text-sm text-center">
                    Enter your email address and we&rsquo;ll send you a reset link.
                  </p>

                  {error && (
                    <div className="border border-red-500/30 bg-red-500/10 rounded-lg px-4 py-3 text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="forgot-email" className="text-warm-muted text-xs tracking-wide">Email address</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="h-11 bg-white/[0.04] border-white/[0.12] text-warm-white rounded-xl placeholder:text-warm-muted/40 focus-visible:ring-gold/30"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full bg-gold text-luxury hover:bg-gold-bright font-semibold text-[11px] tracking-[0.1em] uppercase rounded-xl"
                  >
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : "Send Reset Link"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => { setStep("login"); setError(null); }}
                    className="w-full text-center text-xs text-warm-muted/60 hover:text-warm-white transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />Back to login
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 mx-4 w-full max-w-md"
          >
            <div className="border border-white/[0.12] bg-white/[0.05] backdrop-blur-2xl rounded-2xl p-8 shadow-[0_8px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="mb-8 text-center">
                <motion.div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-gold/30 bg-gold/[0.08]"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                >
                  <Church className="h-7 w-7 text-gold" />
                </motion.div>
                <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold tracking-tight text-warm-white">
                  Warriors Prayer Tower Complex
                </h1>
                <p className="mt-1 text-[11px] text-gold/60 tracking-[0.15em] uppercase">
                  Staff Portal
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 border border-red-500/30 bg-red-500/10 rounded-lg px-4 py-3 text-sm text-red-300"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-warm-muted text-xs tracking-wide">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@wptc.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11 bg-white/[0.04] border-white/[0.12] text-warm-white rounded-xl placeholder:text-warm-muted/40 focus-visible:ring-gold/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-warm-muted text-xs tracking-wide">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-11 bg-white/[0.04] border-white/[0.12] text-warm-white rounded-xl pr-10 placeholder:text-warm-muted/40 focus-visible:ring-gold/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-muted/50 hover:text-warm-white transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setStep("forgot"); setError(null); setForgotEmail(email); }}
                    className="text-xs text-gold/60 hover:text-gold transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full bg-gold text-luxury hover:bg-gold-bright font-semibold text-[11px] tracking-[0.1em] uppercase rounded-xl shadow-[0_4px_15px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-warm-muted/50">
                Access restricted to authorized WPTC staff only.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-luxury">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
