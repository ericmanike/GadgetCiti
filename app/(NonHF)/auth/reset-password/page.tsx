"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/toastProvider";
import { supabase } from "@/lib/supabase";

function ResetPasswordForm() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    if (password.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }

    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      showToast("Password must contain lowercase, uppercase, and a number", "error");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        showToast(updateError.message, "error");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    } catch (err: any) {
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full rounded-[24px] border border-slate-100 bg-white p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-9 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Password Reset Successful!</h2>
        <p className="text-sm font-medium text-slate-500">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[24px] border border-slate-100 bg-white p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-9 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 space-y-1">
        <h1 className="text-[22px] font-bold text-[#0f172a] tracking-tight">Reset Password</h1>
        <p className="text-[13px] font-medium text-slate-500">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Password Input */}
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 text-slate-400">
            <Lock className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 bg-[#f4f5f7] py-3.5 pl-12 pr-12 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400"
            placeholder="New Password"
          />
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

        {/* Confirm Password Input */}
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 text-slate-400">
            <Lock className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 bg-[#f4f5f7] py-3.5 pl-12 pr-12 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400"
            placeholder="Confirm New Password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 z-10 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            {showConfirmPassword ? (
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

        <button
          type="submit"
          disabled={loading || !password || !confirmPassword || password !== confirmPassword}
          className="relative flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#fbcb08] hover:bg-[#eab308] py-3.5 px-4 text-sm font-bold text-slate-900 shadow-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <Spinner className="h-5 w-5" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </button>

        <div className="text-center mt-4">
          <Link href="/auth/login" className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
