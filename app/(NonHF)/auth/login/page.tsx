"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useToast } from "@/components/toastProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Check, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { showToast } = useToast();

  const router = useRouter();
  const searchParams = useSearchParams();

  // Read and sanitize redirect URL
  const rawRedirectTo = searchParams.get("redirectTo") || "/buy";
  const redirectTo = (rawRedirectTo.startsWith("/") && !rawRedirectTo.startsWith("//")) ? rawRedirectTo : "/buy";

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${redirectTo}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      showToast(err.message || "Google Auth failed", "error");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        showToast(error.message, "error");
      } else {
        showToast("Welcome back!", "success");
        // Small delay to let the toast be seen before redirection
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 800);
      }
    } catch (err: any) {
      showToast("Failed to sign in. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full rounded-[24px] border border-slate-100 bg-white p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-9 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Title & Subtitle */}
      <div className="mb-6 space-y-1 text-left">
        <h1 className="text-[22px] font-bold tracking-tight text-[#0f172a]">
          Welcome back
        </h1>
        <p className="text-[13px] font-medium text-slate-500">
          Sign in to your account
        </p>
      </div>

      {/* Google Login Button */}
      <div className="w-full flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={handleGoogleAuth}
          disabled={isGoogleLoading || isLoading}
          className="flex justify-center cursor-pointer items-center gap-3 border w-full px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm bg-white"
        >
          <svg width="20" height="20" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">
            {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
          </span>
        </motion.button>
        <div className="relative flex items-center py-3">
          <div className="grow border-t border-gray-200"></div>
          <span className="shrink mx-4 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold">or</span>
          <div className="grow border-t border-gray-200"></div>
        </div>
      </div>

      {/* Sign In Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Email input */}
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 text-slate-400">
            <Mail className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="block w-full rounded-xl border border-slate-200 bg-[#f4f5f7] py-3.5 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {/* Password Input */}
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 text-slate-400">
            <Lock className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="block w-full rounded-xl border border-slate-200 bg-[#f4f5f7] py-3.5 pl-12 pr-12 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400"
          />
          {/* Password Visibility Toggle */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 z-10 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" strokeWidth={1.8} />
            ) : (
              <Eye className="h-5 w-5" strokeWidth={1.8} />
            )}
          </button>
        </div>

        {/* Remember me Checkbox & Forgot Password */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="relative flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-4.5 w-4.5 rounded bg-white border border-slate-300 peer-checked:bg-[#1e3a8a] peer-checked:border-[#1e3a8a] flex items-center justify-center transition-all peer-focus:ring-2 peer-focus:ring-slate-300">
              <Check className="h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
            </div>
            <span className="ml-2.5 text-[13px] font-medium text-slate-600 hover:text-slate-800 transition-colors">
              Remember me
            </span>
          </label>

          <Link
            href="/auth/forgot-password"
            className="text-[13px] font-bold text-[#fb923c] hover:text-[#f97316] transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Yellow Submit CTA */}
        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="relative flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#fbcb08] hover:bg-[#eab308] py-3.5 px-4 text-sm font-bold text-slate-900 shadow-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-900" />
          ) : (
            <>
              Sign In
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </>
          )}
        </button>
      </form>

      {/* Footer Switch Page link */}
      <p className="mt-6 text-center text-[13px] font-medium text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href={`/auth/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="font-bold text-[#fb923c] hover:text-[#f97316] transition-colors"
        >
        Create one 
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full rounded-[24px] border border-slate-100 bg-white p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-9 flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#fbcb08]" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
