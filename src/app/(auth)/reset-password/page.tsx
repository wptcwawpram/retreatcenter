"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { IMAGES } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2, Eye, EyeOff, Check, X, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const PASSWORD_RULES = [
  { label: "8 or more characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number (0-9)", test: (p: string) => /\d/.test(p) },
  { label: "Symbol (!@#$...)", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const allPassed = PASSWORD_RULES.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword && password.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allPassed) {
      setError("Password does not meet all requirements.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image src={IMAGES.hero.home} alt="WPTC" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-4 w-full max-w-md"
      >
        <div className="border border-white/[0.12] bg-white/[0.05] backdrop-blur-2xl rounded-2xl p-8 shadow-[0_8px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-gold/30 bg-gold/[0.08]">
              <KeyRound className="h-7 w-7 text-gold" />
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-white">
              Set New Password
            </h2>
            <p className="mt-1 text-sm text-warm-muted">
              Choose a strong password for your account.
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-emerald-400" />
              </div>
              <p className="text-warm-white font-semibold">Password Updated!</p>
              <p className="text-warm-muted text-sm">Redirecting to login...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="border border-red-500/30 bg-red-500/10 rounded-lg px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-warm-muted text-xs tracking-wide">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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

                <div className="space-y-1 pt-1">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <div key={rule.label} className="flex items-center gap-2 text-xs">
                        {password ? (
                          passed ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <X className="h-3 w-3 text-red-400" />
                          )
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
                <Label htmlFor="confirm-password" className="text-warm-muted text-xs tracking-wide">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 bg-white/[0.04] border-white/[0.12] text-warm-white rounded-xl placeholder:text-warm-muted/40 focus-visible:ring-gold/30"
                />
                {confirmPassword && (
                  <p className={`text-xs flex items-center gap-1 ${passwordsMatch ? "text-emerald-400" : "text-red-400"}`}>
                    {passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !allPassed || !passwordsMatch}
                className="h-11 w-full bg-gold text-luxury hover:bg-gold-bright font-semibold text-[11px] tracking-[0.1em] uppercase rounded-xl disabled:opacity-40"
              >
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : "Update Password"}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-luxury">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
