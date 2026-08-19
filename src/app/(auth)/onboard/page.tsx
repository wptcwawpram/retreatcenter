"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { IMAGES } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, Check, X, CheckCircle, Shield, Phone, KeyRound, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteLogo } from "@/lib/use-site-logo";

const PASSWORD_RULES = [
  { label: "8 or more characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number (0-9)", test: (p: string) => /\d/.test(p) },
  { label: "Symbol (!@#$...)", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

type Step = "loading" | "welcome" | "verify" | "password" | "done" | "error";

interface InviteInfo {
  id: string;
  full_name: string;
  role: string;
  phone: string | null;
  avatar_url: string | null;
}

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    const arr = digits.slice();
    arr[index] = char;
    const newVal = arr.join("").replace(/\s/g, "");
    onChange(newVal);
    if (char && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-2.5 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className="w-12 h-14 text-center text-xl font-mono font-bold rounded-xl bg-white/15 border-2 border-white/30 text-white focus:border-gold focus:ring-2 focus:ring-gold/30 outline-none transition-all placeholder:text-white/20"
          placeholder="·"
        />
      ))}
    </div>
  );
}

function SiteLogo() {
  const siteLogo = useSiteLogo();
  if (siteLogo) {
    return <Image src={siteLogo} alt="WPTC" width={140} height={48} className="h-10 w-auto object-contain mx-auto mb-6" unoptimized />;
  }
  return null;
}

function OnboardForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState<Step>("loading");
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // OTP state
  const [otpSending, setOtpSending] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Password state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passError, setPassError] = useState("");

  const allPassed = PASSWORD_RULES.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword && password.length > 0;

  useEffect(() => {
    if (!token) { setStep("error"); setErrorMsg("No invitation token provided."); return; }
    fetch(`/api/employees/onboard?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setStep("error"); setErrorMsg(data.error); }
        else { setInvite(data); setStep("welcome"); }
      })
      .catch(() => { setStep("error"); setErrorMsg("Failed to load invitation."); });
  }, [token]);

  const handleSendOtp = async () => {
    setOtpSending(true);
    setOtpError("");
    try {
      const res = await fetch("/api/employees/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_otp", token }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.error); return; }
      setMaskedPhone(data.masked);
      setStep("verify");
    } catch { setOtpError("Network error"); }
    finally { setOtpSending(false); }
  };

  const handleVerifyOtp = async () => {
    setVerifying(true);
    setOtpError("");
    try {
      const res = await fetch("/api/employees/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_otp", token, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.error); return; }
      setStep("password");
    } catch { setOtpError("Network error"); }
    finally { setVerifying(false); }
  };

  const handleSetPassword = async () => {
    if (!allPassed || !passwordsMatch) return;
    setSaving(true);
    setPassError("");
    try {
      const res = await fetch("/api/employees/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_password", token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setPassError(data.error); return; }
      setStep("done");
      setTimeout(() => router.push("/login"), 4000);
    } catch { setPassError("Network error"); }
    finally { setSaving(false); }
  };

  const ROLE_LABELS: Record<string, string> = {
    super_admin: "Super Admin", admin: "Administrator", manager: "Manager",
    receptionist: "Receptionist", housekeeping: "Housekeeping",
    accountant: "Accountant", maintenance: "Maintenance",
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image src={IMAGES.hero.home} alt="WPTC" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 mx-4 w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* Loading */}
          {step === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-gold" />
              <p className="mt-4 text-warm-muted text-sm">Loading invitation...</p>
            </motion.div>
          )}

          {/* Error */}
          {step === "error" && (
            <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="border border-red-500/30 bg-white/[0.05] backdrop-blur-2xl rounded-2xl p-8 shadow-[0_8px_60px_rgba(0,0,0,0.4)] text-center">
              <SiteLogo />
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10">
                <X className="h-7 w-7 text-red-400" />
              </div>
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-white mb-2">Invalid Invitation</h2>
              <p className="text-warm-muted text-sm">{errorMsg}</p>
              <Button onClick={() => router.push("/login")} className="mt-6 h-11 bg-gold text-luxury hover:bg-gold-bright font-semibold text-[11px] tracking-[0.1em] uppercase rounded-xl">
                Go to Login
              </Button>
            </motion.div>
          )}

          {/* Step 1: Welcome / Accept */}
          {step === "welcome" && invite && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="border border-white/[0.12] bg-white/[0.05] backdrop-blur-2xl rounded-2xl p-8 shadow-[0_8px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <SiteLogo />
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-gold/30 bg-gold/[0.08]">
                  <UserCheck className="h-7 w-7 text-gold" />
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-white">
                  Staff Invitation
                </h2>
                <p className="mt-1 text-sm text-warm-muted">
                  Warriors Prayer Tower Complex
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                  {invite.avatar_url ? (
                    <Image src={invite.avatar_url} alt={invite.full_name} width={40} height={40} className="h-10 w-10 rounded-lg object-cover shrink-0" unoptimized />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center text-sm font-bold text-gold shrink-0">
                      {invite.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-warm-white font-medium">{invite.full_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Shield className="h-3 w-3 text-gold/60" />
                      <span className="text-xs text-gold/80">{ROLE_LABELS[invite.role] ?? invite.role}</span>
                    </div>
                  </div>
                </div>
                {invite.phone && (
                  <div className="flex items-center gap-2 px-3 text-xs text-warm-muted">
                    <Phone className="h-3 w-3" />
                    <span>Phone ending in ...{invite.phone.slice(-4)}</span>
                  </div>
                )}
              </div>

              <p className="text-[12px] text-warm-muted/70 mb-5 text-center">
                To accept this invitation, you will verify your phone number and set a password for your account.
              </p>

              <Button onClick={handleSendOtp} disabled={otpSending}
                className="h-11 w-full bg-gold text-luxury hover:bg-gold-bright font-semibold text-[11px] tracking-[0.1em] uppercase rounded-xl disabled:opacity-40">
                {otpSending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending code...</> : "Accept & Verify Phone"}
              </Button>
              {otpError && <p className="text-red-400 text-xs mt-2 text-center">{otpError}</p>}
            </motion.div>
          )}

          {/* Step 2: Verify Phone — individual digit boxes */}
          {step === "verify" && (
            <motion.div key="verify" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="border border-white/[0.12] bg-white/[0.05] backdrop-blur-2xl rounded-2xl p-8 shadow-[0_8px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <SiteLogo />
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-gold/30 bg-gold/[0.08]">
                  <Phone className="h-7 w-7 text-gold" />
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-white">
                  Verify Phone Number
                </h2>
                <p className="mt-1 text-sm text-warm-muted">
                  Enter the 6-digit code sent to {maskedPhone}
                </p>
              </div>

              <div className="space-y-5">
                {otpError && (
                  <div className="border border-red-500/30 bg-red-500/10 rounded-lg px-4 py-3 text-sm text-red-300">
                    {otpError}
                  </div>
                )}

                <OtpInput value={otpCode} onChange={setOtpCode} />

                <Button onClick={handleVerifyOtp} disabled={verifying || otpCode.length !== 6}
                  className="h-11 w-full bg-gold text-luxury hover:bg-gold-bright font-semibold text-[11px] tracking-[0.1em] uppercase rounded-xl disabled:opacity-40">
                  {verifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : "Verify Code"}
                </Button>

                <button onClick={() => { setOtpCode(""); handleSendOtp(); }} disabled={otpSending} className="w-full text-center text-xs text-warm-muted hover:text-gold transition-colors disabled:opacity-40">
                  {otpSending ? "Sending..." : "Didn't receive it? Resend code"}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Set Password */}
          {step === "password" && (
            <motion.div key="password" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="border border-white/[0.12] bg-white/[0.05] backdrop-blur-2xl rounded-2xl p-8 shadow-[0_8px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <SiteLogo />
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-gold/30 bg-gold/[0.08]">
                  <KeyRound className="h-7 w-7 text-gold" />
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-white">
                  Set Your Password
                </h2>
                <p className="mt-1 text-sm text-warm-muted">
                  Choose a strong password for your account.
                </p>
              </div>

              <div className="space-y-5">
                {passError && (
                  <div className="border border-red-500/30 bg-red-500/10 rounded-lg px-4 py-3 text-sm text-red-300">
                    {passError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-warm-muted text-xs tracking-wide">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 bg-white/[0.04] border-white/[0.12] text-warm-white rounded-xl pr-10 placeholder:text-warm-muted/40 focus-visible:ring-gold/30"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-muted/50 hover:text-warm-white transition-colors" tabIndex={-1}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="space-y-1 pt-1">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(password);
                      return (
                        <div key={rule.label} className="flex items-center gap-2 text-xs">
                          {password ? (
                            passed ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-red-400" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-warm-muted/30" />
                          )}
                          <span className={password ? (passed ? "text-emerald-400" : "text-red-400") : "text-warm-muted/60"}>
                            {rule.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-warm-muted text-xs tracking-wide">Confirm Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 bg-white/[0.04] border-white/[0.12] text-warm-white rounded-xl placeholder:text-warm-muted/40 focus-visible:ring-gold/30"
                  />
                  {confirmPassword && (
                    <p className={`text-xs flex items-center gap-1 ${passwordsMatch ? "text-emerald-400" : "text-red-400"}`}>
                      {passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </p>
                  )}
                </div>

                <Button onClick={handleSetPassword} disabled={saving || !allPassed || !passwordsMatch}
                  className="h-11 w-full bg-gold text-luxury hover:bg-gold-bright font-semibold text-[11px] tracking-[0.1em] uppercase rounded-xl disabled:opacity-40">
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Setting up...</> : "Complete Setup"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Done */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="border border-white/[0.12] bg-white/[0.05] backdrop-blur-2xl rounded-2xl p-8 shadow-[0_8px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] text-center">
              <SiteLogo />
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-white mb-2">
                Account Ready!
              </h2>
              <p className="text-warm-muted text-sm mb-1">
                Welcome to the team, {invite?.full_name.split(" ")[0]}!
              </p>
              <p className="text-warm-muted/60 text-xs">
                Redirecting to login...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function OnboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-luxury">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      }
    >
      <OnboardForm />
    </Suspense>
  );
}
