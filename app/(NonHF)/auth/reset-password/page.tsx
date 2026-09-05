"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/toastProvider";
import { supabase } from "@/lib/supabase";

const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain a lowercase letter")
    .matches(/[A-Z]/, "Password must contain an uppercase letter")
    .matches(/[0-9]/, "Password must contain a number")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

function ResetPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showToast } = useToast();

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      setLoading(true);

      try {
        const { error: updateError } = await supabase.auth.updateUser({
          password: values.password,
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
    },
  });

  const passwordVal = formik.values.password;

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

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* Password Input */}
        <div>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-4 text-slate-400">
              <Lock className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              {...formik.getFieldProps("password")}
              className={`block w-full rounded-xl border ${formik.touched.password && formik.errors.password ? "border-red-400" : "border-slate-200"} bg-[#f4f5f7] py-3.5 pl-12 pr-12 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-[#1e293b] focus:bg-white focus:ring-1 focus:ring-[#1e293b]`}
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
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-[12px] font-medium text-red-500">{formik.errors.password}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-4 text-slate-400">
              <Lock className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              {...formik.getFieldProps("confirmPassword")}
              className={`block w-full rounded-xl border ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-400" : "border-slate-200"} bg-[#f4f5f7] py-3.5 pl-12 pr-12 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-[#1e293b] focus:bg-white focus:ring-1 focus:ring-[#1e293b]`}
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
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="mt-1 text-[12px] font-medium text-red-500">{formik.errors.confirmPassword}</p>
          )}
        </div>

        {/* Password Requirements Check */}
        {passwordVal.length > 0 && (
          <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
            <div className={passwordVal.length >= 8 ? "text-green-600 font-medium" : "text-red-500"}>
              ✓ At least 8 characters long ({passwordVal.length}/8)
            </div>
            <div className={/[a-z]/.test(passwordVal) ? "text-green-600 font-medium" : "text-red-500"}>
              ✓ At least one lowercase letter
            </div>
            <div className={/[A-Z]/.test(passwordVal) ? "text-green-600 font-medium" : "text-red-500"}>
              ✓ At least one uppercase letter
            </div>
            <div className={/[0-9]/.test(passwordVal) ? "text-green-600 font-medium" : "text-red-500"}>
              ✓ At least one number
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !formik.isValid || !formik.dirty}
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
