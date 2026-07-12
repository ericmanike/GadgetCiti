"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";

import { useToast } from "@/components/toastProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Phone, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read and sanitize redirect URL
  const rawRedirectTo = searchParams.get("redirectTo") || "/buy";
  const redirectTo = (rawRedirectTo.startsWith("/") && !rawRedirectTo.startsWith("//")) ? rawRedirectTo : "/buy";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { showToast } = useToast();

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

    if (password.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      showToast("Password must contain lowercase, uppercase, and a number", "error");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Sync user details to public database table
        const { error: dbError } = await supabase
          .from("users")
          .upsert({
            id: data.user.id,
            name: name,
            email: email,
            phone: phone,
          });

        if (dbError) {
          console.error("Database Sync Error:", dbError);
        }
      }

      if (data.session) {
        showToast("Account created and logged in!", "success");
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 800);
        return;
      }

      showToast("Account created! Please check your email for verification.", "success");
      setTimeout(() => {
        router.push(`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
      }, 3000);

    } catch (err: any) {
      showToast(err.message || "Signup failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full rounded-[24px] border border-slate-100 bg-white p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-9 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Title & Subtitle */}
      <div className="mb-6 space-y-1 text-left">
        <h1 className="text-[22px] font-bold tracking-tight text-[#0f172a]">
          Create account
        </h1>
        <p className="text-[13px] font-medium text-slate-500">
          Sign up to get started as a reseller
        </p>
      </div>

      {/* Google Sign Up */}
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
            {isGoogleLoading ? 'Connecting...' : 'Sign up with Google'}
          </span>
        </motion.button>
        <div className="relative flex items-center py-3">
          <div className="grow border-t border-gray-200"></div>
          <span className="shrink mx-4 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold">or</span>
          <div className="grow border-t border-gray-200"></div>
        </div>
      </div>

      {/* Sign Up Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>

        {/* Full Name input */}
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 text-slate-400">
            <User className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="block w-full rounded-xl border border-slate-200 bg-[#f4f5f7] py-3.5 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {/* Phone input */}
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 text-slate-400">
            <Phone className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <input
            type="text"
            required
            autoComplete="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            className="block w-full rounded-xl border border-slate-200 bg-[#f4f5f7] py-3.5 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400"
          />
        </div>

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
            placeholder="Email Address"
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
            autoComplete="new-password"
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

        {/* Password Requirements Check */}
        {password.length > 0 && (
          <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
            <div className={password.length >= 8 ? "text-green-600 font-medium" : "text-red-500"}>
              ✓ At least 8 characters long ({password.length}/8)
            </div>
            <div className={/[a-z]/.test(password) ? "text-green-600 font-medium" : "text-red-500"}>
              ✓ At least one lowercase letter
            </div>
            <div className={/[A-Z]/.test(password) ? "text-green-600 font-medium" : "text-red-500"}>
              ✓ At least one uppercase letter
            </div>
            <div className={/[0-9]/.test(password) ? "text-green-600 font-medium" : "text-red-500"}>
              ✓ At least one number
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            isLoading ||
            isGoogleLoading ||
            !name ||
            !phone ||
            !email ||
            !password ||
            password.length < 8 ||
            !/[a-z]/.test(password) ||
            !/[A-Z]/.test(password) ||
            !/[0-9]/.test(password)
          }
          className="relative flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#fbcb08] hover:bg-[#eab308] py-3.5 px-4 text-sm font-bold text-slate-900 shadow-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-900" />
          ) : (
            <>
              Create Account
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </>
          )}
        </button>
      </form>

      {/* Footer Switch Page link */}
      <p className="mt-6 text-center text-[13px] font-medium text-slate-500">
        Already have an account?{" "}
        <Link
          href={`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="font-bold text-[#fb923c] hover:text-[#f97316] transition-colors"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="w-full rounded-[24px] border border-slate-100 bg-white p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-9 flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#fbcb08]" />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
