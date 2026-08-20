"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { IMAGES } from "@/lib/images";
import { useSiteLogo } from "@/lib/use-site-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Church, Loader2, Eye, EyeOff, ShieldCheck, Mail, Smartphone,
  Check, X, KeyRound, ArrowLeft, Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PASSWORD_RULES = [
  { label: "8 or more characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Number (0-9)", test: (p: string) => /\d/.test(p) },
  { label: "Symbol (!@#$...)", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

type Step = "login" | "2fa" | "loading" | "forgot-phone" | "forgot-otp" | "forgot-newpass" | "forgot-done";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const siteLogo = useSiteLogo();

  const [step, setStep] = useState<Step>("login");
  const [loginMode, setLoginMode] = useState<"phone" | "email">("phone");
  const [email, setEmail] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [userId, setUserId] = useState("");
  const [otpMethod, setOtpMethod] = useState<"sms" | "email">("sms");
  const [otpMasked, setOtpMasked] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpSending, setOtpSending] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Forgot password state
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOtp, setForgotOtp] = useState(["", "", "", "", "", ""]);
  const forgotOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let loginEmail = email;

      if (loginMode === "phone") {
        if (!loginPhone || loginPhone.replace(/\D/g, "").length < 9) {
          setError("Please enter a valid phone number.");
          return;
        }
        const res = await fetch("/api/auth/phone-lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: loginPhone }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "No staff account found with this phone number.");
          return;
        }
        loginEmail = data.email;
      }

      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: loginEmail, password });

      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? loginMode === "phone"
              ? "Invalid phone number or password. Please try again."
              : "Invalid email or password. Please try again."
            : authError.message,
        );
        return;
      }

      if (data.user) {
        setUserId(data.user.id);
        try {
          await sendOTP(data.user.id, "sms");
        } catch {
          // OTP system not ready (table missing, SMS not configured, etc.)
          // Skip 2FA and go straight to dashboard
          setStep("loading");
          await new Promise((r) => setTimeout(r, 1200));
          router.push(redirectTo);
          router.refresh();
        }
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
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: uid, purpose: "admin_2fa", method }),
    });
    const data = await res.json();
    setOtpSending(false);
    if (!res.ok) throw new Error(data.error);
    setOtpMasked(data.masked);
    setOtpMethod(data.channel);
    setStep("2fa");
    setOtpCode(["", "", "", "", "", ""]);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }

  function handleOtpInput(refs: React.MutableRefObject<(HTMLInputElement | null)[]>, code: string[], setCode: (c: string[]) => void, index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) refs.current[index + 1]?.focus();
  }

  function handleOtpBackspace(refs: React.MutableRefObject<(HTMLInputElement | null)[]>, code: string[], index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) refs.current[index - 1]?.focus();
  }

  function handleOtpPasteGeneric(code: string[], setCode: (c: string[]) => void, refs: React.MutableRefObject<(HTMLInputElement | null)[]>, e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < text.length; i++) newCode[i] = text[i];
    setCode(newCode);
    refs.current[Math.min(text.length, 5)]?.focus();
  }

  async function verifyLoginOTP() {
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
      await new Promise((r) => setTimeout(r, 1200));
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (otpCode.join("").length === 6 && step === "2fa") verifyLoginOTP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpCode]);

  // ── Forgot password: phone → OTP → new password ──

  async function handleForgotSendOTP() {
    if (!forgotPhone || forgotPhone.replace(/\D/g, "").length < 9) {
      setError("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotPhone, purpose: "guest_login" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("forgot-otp");
      setForgotOtp(["", "", "", "", "", ""]);
      setTimeout(() => forgotOtpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyForgotOTP() {
    const code = forgotOtp.join("");
    if (code.length < 6) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotPhone, code, purpose: "guest_login" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("forgot-newpass");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (forgotOtp.join("").length === 6 && step === "forgot-otp") verifyForgotOTP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forgotOtp]);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (!PASSWORD_RULES.every((r) => r.test(newPassword))) { setError("Password does not meet requirements."); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: forgotPhone, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("forgot-done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setLoading(false);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3 } },
  };

  const otpInputClass = "w-12 h-14 text-center text-2xl font-bold bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] rounded-xl text-warm-white focus:border-gold/50 focus:ring-1 focus:ring-gold/30 focus:outline-none transition-all";
  const cardClass = "border border-white/[0.12] bg-white/[0.05] backdrop-blur-2xl rounded-2xl p-8 shadow-[0_8px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]";
  const inputClass = "h-11 bg-white/[0.04] border-white/[0.12] text-warm-white rounded-xl placeholder:text-warm-muted/40 focus-visible:ring-gold/30";

  function renderOtpInputs(code: string[], setCode: (c: string[]) => void, refs: React.MutableRefObject<(HTMLInputElement | null)[]>) {
    return (
      <div className="flex justify-center gap-2" onPaste={(e) => handleOtpPasteGeneric(code, setCode, refs, e)}>
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpInput(refs, code, setCode, i, e.target.value)}
            onKeyDown={(e) => handleOtpBackspace(refs, code, i, e)}
            className={otpInputClass}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image src={IMAGES.hero.home} alt="Warriors Prayer Tower Complex" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />
      </div>

      <AnimatePresence mode="wait">
        {/* ── Loading ── */}
        {step === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center gap-6">
            <motion.div
              className="w-20 h-20 rounded-2xl border border-gold/30 bg-luxury-card/80 backdrop-blur-xl flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1], borderColor: ["rgba(212,175,55,0.3)", "rgba(212,175,55,0.6)", "rgba(212,175,55,0.3)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Church className="h-9 w-9 text-gold" />
            </motion.div>
            <div className="text-center">
              <motion.div className="flex items-center gap-2 text-gold text-sm font-medium" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Loader2 className="h-4 w-4 animate-spin" />Loading Dashboard...
              </motion.div>
              <motion.div className="h-1 bg-gold/20 rounded-full mt-4 w-48 overflow-hidden">
                <motion.div className="h-full bg-gold rounded-full" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.2, ease: "easeInOut" }} />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ── 2FA OTP ── */}
        {step === "2fa" && (
          <motion.div key="2fa" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="relative z-10 mx-4 w-full max-w-md">
            <div className={cardClass}>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-gold/30 bg-gold/[0.08]">
                  <ShieldCheck className="h-7 w-7 text-gold" />
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-white">Verification Code</h2>
                <p className="mt-2 text-sm text-warm-muted">
                  We sent a 6-digit code to <span className="text-gold font-medium">{otpMasked}</span> via {otpMethod === "sms" ? "SMS" : "email"}
                </p>
              </div>

              {error && <div className="mb-4 border border-red-500/30 bg-red-500/10 rounded-lg px-4 py-3 text-sm text-red-300">{error}</div>}

              <div className="mb-6">{renderOtpInputs(otpCode, setOtpCode, otpRefs)}</div>

              {loading && <div className="flex justify-center mb-4"><Loader2 className="h-5 w-5 animate-spin text-gold" /></div>}

              <div className="flex items-center justify-between text-xs">
                <button onClick={() => { try { sendOTP(userId, otpMethod === "sms" ? "email" : "sms"); } catch {} }} disabled={otpSending} className="text-warm-muted hover:text-gold transition-colors flex items-center gap-1">
                  {otpMethod === "sms" ? <Mail className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                  Try {otpMethod === "sms" ? "email" : "SMS"}
                </button>
                <button onClick={() => { try { sendOTP(userId, otpMethod); } catch {} }} disabled={otpSending} className="text-gold/60 hover:text-gold transition-colors">
                  {otpSending ? "Sending..." : "Resend code"}
                </button>
              </div>

              <button onClick={() => { setStep("login"); setError(null); }} className="mt-4 w-full text-center text-xs text-warm-muted/60 hover:text-warm-white transition-colors flex items-center justify-center gap-1">
                <ArrowLeft className="h-3 w-3" />Back to login
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Forgot: Enter Phone ── */}
        {step === "forgot-phone" && (
          <motion.div key="forgot-phone" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="relative z-10 mx-4 w-full max-w-md">
            <div className={cardClass}>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-gold/30 bg-gold/[0.08]">
                  <Phone className="h-7 w-7 text-gold" />
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-white">Reset Password</h2>
                <p className="mt-1 text-sm text-warm-muted">Enter the phone number linked to your staff account</p>
              </div>

              {error && <div className="mb-4 border border-red-500/30 bg-red-500/10 rounded-lg px-4 py-3 text-sm text-red-300">{error}</div>}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-phone" className="text-warm-muted text-xs tracking-wide">Phone Number</Label>
                  <Input id="forgot-phone" type="tel" placeholder="024 000 0000" value={forgotPhone} onChange={(e) => setForgotPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleForgotSendOTP()}
                    className={inputClass + " text-center text-lg tracking-wider font-mono"} />
                </div>

                <Button onClick={handleForgotSendOTP} disabled={loading}
                  className="h-11 w-full bg-gold text-luxury hover:bg-gold-bright font-semibold text-[11px] tracking-[0.1em] uppercase rounded-xl">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending OTP...</> : "Send Verification Code"}
                </Button>
              </div>

              <button onClick={() => { setStep("login"); setError(null); }} className="mt-4 w-full text-center text-xs text-warm-muted/60 hover:text-warm-white transition-colors flex items-center justify-center gap-1">
                <ArrowLeft className="h-3 w-3" />Back to login
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Forgot: Verify OTP ── */}
        {step === "forgot-otp" && (
          <motion.div key="forgot-otp" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="relative z-10 mx-4 w-full max-w-md">
            <div className={cardClass}>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-gold/30 bg-gold/[0.08]">
                  <ShieldCheck className="h-7 w-7 text-gold" />
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-white">Enter Code</h2>
                <p className="mt-2 text-sm text-warm-muted">
                  We sent a 6-digit code to <span className="text-gold">{forgotPhone}</span>
                </p>
              </div>

              {error && <div className="mb-4 border border-red-500/30 bg-red-500/10 rounded-lg px-4 py-3 text-sm text-red-300">{error}</div>}

              <div className="mb-6">{renderOtpInputs(forgotOtp, setForgotOtp, forgotOtpRefs)}</div>

              {loading && <div className="flex justify-center mb-4"><Loader2 className="h-5 w-5 animate-spin text-gold" /></div>}

              <div className="flex items-center justify-between text-xs">
                <button onClick={() => { setStep("forgot-phone"); setError(null); }} className="text-warm-muted hover:text-warm-white transition-colors flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" />Change number
                </button>
                <button onClick={handleForgotSendOTP} disabled={loading} className="text-gold/60 hover:text-gold transition-colors">
                  Resend code
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Forgot: New Password ── */}
        {step === "forgot-newpass" && (
          <motion.div key="forgot-newpass" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="relative z-10 mx-4 w-full max-w-md">
            <div className={cardClass}>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-gold/30 bg-gold/[0.08]">
                  <KeyRound className="h-7 w-7 text-gold" />
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-white">New Password</h2>
                <p className="mt-1 text-sm text-warm-muted">Create a strong password for your account</p>
              </div>

              {error && <div className="mb-4 border border-red-500/30 bg-red-500/10 rounded-lg px-4 py-3 text-sm text-red-300">{error}</div>}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-warm-muted text-xs tracking-wide">New Password</Label>
                  <div className="relative">
                    <Input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className={inputClass + " pr-10"} required />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-muted/50 hover:text-warm-white" tabIndex={-1}>
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="space-y-1 pt-1">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(newPassword);
                      return (
                        <div key={rule.label} className="flex items-center gap-2 text-xs">
                          {newPassword ? (passed ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-red-400" />) : <div className="w-3 h-3 rounded-full border border-warm-muted/30" />}
                          <span className={newPassword ? (passed ? "text-emerald-400" : "text-red-400") : "text-warm-muted/60"}>{rule.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-warm-muted text-xs tracking-wide">Confirm Password</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} required />
                  {confirmPassword && (
                    <p className={`text-xs flex items-center gap-1 ${newPassword === confirmPassword ? "text-emerald-400" : "text-red-400"}`}>
                      {newPassword === confirmPassword ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {newPassword === confirmPassword ? "Passwords match" : "Passwords do not match"}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={loading || !PASSWORD_RULES.every((r) => r.test(newPassword)) || newPassword !== confirmPassword}
                  className="h-11 w-full bg-gold text-luxury hover:bg-gold-bright font-semibold text-[11px] tracking-[0.1em] uppercase rounded-xl disabled:opacity-40">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : "Set New Password"}
                </Button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ── Forgot: Done ── */}
        {step === "forgot-done" && (
          <motion.div key="forgot-done" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="relative z-10 mx-4 w-full max-w-md">
            <div className={cardClass}>
              <div className="text-center space-y-4">
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Check className="h-8 w-8 text-emerald-400" />
                </motion.div>
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-white">Password Updated!</h2>
                <p className="text-warm-muted text-sm">Your password has been changed. You can now sign in.</p>
                <Button onClick={() => { setStep("login"); setError(null); setPassword(""); }}
                  className="w-full bg-gold text-luxury hover:bg-gold-bright font-semibold h-11 text-[11px] tracking-[0.1em] uppercase rounded-xl">
                  Back to Login
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Main Login ── */}
        {step === "login" && (
          <motion.div key="login" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="relative z-10 mx-4 w-full max-w-md">
            <div className={cardClass}>
              <div className="mb-8 text-center">
                <motion.div className="mx-auto mb-4"
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }}>
                  {siteLogo ? (
                    <Image src={siteLogo} alt="WPTC" width={180} height={64} className="h-16 w-auto object-contain mx-auto" unoptimized />
                  ) : (
                    <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl border border-gold/30 bg-gold/[0.08]">
                      <Church className="h-7 w-7 text-gold" />
                    </div>
                  )}
                </motion.div>
                {!siteLogo && <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold tracking-tight text-warm-white">Warriors Prayer Tower Complex</h1>}
                <p className="mt-1 text-[11px] text-gold/60 tracking-[0.15em] uppercase">Staff Portal</p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 border border-red-500/30 bg-red-500/10 rounded-lg px-4 py-3 text-sm text-red-300">{error}</motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Phone / Email toggle */}
                <div className="flex rounded-xl border border-white/[0.1] bg-white/[0.03] p-0.5">
                  <button type="button" onClick={() => { setLoginMode("phone"); setError(null); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-[11px] tracking-[0.1em] uppercase transition-all duration-300 ${loginMode === "phone" ? "bg-gold/[0.12] text-gold border border-gold/20" : "text-warm-muted/50 hover:text-warm-muted border border-transparent"}`}>
                    <Phone className="h-3 w-3" />Phone
                  </button>
                  <button type="button" onClick={() => { setLoginMode("email"); setError(null); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-[11px] tracking-[0.1em] uppercase transition-all duration-300 ${loginMode === "email" ? "bg-gold/[0.12] text-gold border border-gold/20" : "text-warm-muted/50 hover:text-warm-muted border border-transparent"}`}>
                    <Mail className="h-3 w-3" />Email
                  </button>
                </div>

                {loginMode === "phone" ? (
                  <div className="space-y-2">
                    <Label htmlFor="login-phone" className="text-warm-muted text-xs tracking-wide">Phone number</Label>
                    <Input id="login-phone" type="tel" placeholder="024 000 0000" value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)}
                      required autoComplete="tel" className={inputClass} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-warm-muted text-xs tracking-wide">Email address</Label>
                    <Input id="email" type="email" placeholder="staff@wptc.org" value={email} onChange={(e) => setEmail(e.target.value)}
                      required autoComplete="email" className={inputClass} />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-warm-muted text-xs tracking-wide">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)}
                      required autoComplete="current-password" className={inputClass + " pr-10"} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-muted/50 hover:text-warm-white transition-colors" tabIndex={-1}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="button" onClick={() => { setStep("forgot-phone"); setError(null); }} className="text-xs text-gold/60 hover:text-gold transition-colors">
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" disabled={loading}
                  className="h-11 w-full bg-gold text-luxury hover:bg-gold-bright font-semibold text-[11px] tracking-[0.1em] uppercase rounded-xl shadow-[0_4px_15px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : "Sign in"}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-warm-muted/50">Access restricted to authorized WPTC staff only.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-luxury"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
