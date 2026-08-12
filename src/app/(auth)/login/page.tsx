"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { IMAGES } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Church, Loader2, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
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

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div className="absolute inset-0 z-0">
        <Image
          src={IMAGES.hero.home}
          alt="Warriors Prayer Tower Complex"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      <div className="relative z-10 mx-4 w-full max-w-md">
        <div className="border border-gold/15 bg-luxury-card/95 p-8 backdrop-blur-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-gold/30">
              <Church className="h-7 w-7 text-gold" />
            </div>
            <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold tracking-tight text-warm-white">
              Warriors Prayer Tower Complex
            </h1>
            <p className="mt-1 text-[11px] text-gold/60 tracking-[0.15em] uppercase">
              Staff Portal
            </p>
          </div>

          {error && (
            <div className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
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
                className="h-11 bg-luxury border-gold/15 text-warm-white placeholder:text-warm-muted/40 focus-visible:ring-gold/30"
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
                  className="h-11 bg-luxury border-gold/15 text-warm-white pr-10 placeholder:text-warm-muted/40 focus-visible:ring-gold/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-muted/50 hover:text-warm-white"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full bg-gold text-luxury hover:bg-gold-bright font-semibold text-[11px] tracking-[0.1em] uppercase"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-warm-muted/50">
            Access restricted to authorized WPTC staff only.
          </p>
        </div>
      </div>
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
