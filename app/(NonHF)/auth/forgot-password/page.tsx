"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, Mail } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/toastProvider";
import { supabase } from "@/lib/supabase";

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string().trim().email("Invalid email address").required("Email Address is required"),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);

      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(values.email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (resetError) {
          showToast(resetError.message, "error");
        } else {
          showToast("A password reset link has been sent to your email address.", "success");
          resetForm();
        }
      } catch (err: any) {
        showToast("An error occurred. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="w-full rounded-[24px] border border-slate-100 bg-white p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-9 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={16} />
        Back to Login
      </Link>

      <div className="mb-6 space-y-1">
        <h1 className="text-[22px] font-bold text-[#0f172a] tracking-tight">Forgot Password?</h1>
        <p className="text-[14px] font-medium text-slate-500">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-4 text-slate-400">
              <Mail className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              {...formik.getFieldProps("email")}
              className={`block w-full rounded-xl border ${formik.touched.email && formik.errors.email ? "border-red-400" : "border-slate-200"} bg-[#f4f5f7] py-3.5 pl-12 pr-4 text-[16px] text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-[#1e293b] focus:bg-white focus:ring-1 focus:ring-[#1e293b]`}
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-[12px] font-medium text-red-500">{formik.errors.email}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !formik.isValid || !formik.dirty}
          className="relative flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#fbcb08] hover:bg-[#eab308] py-3.5 px-4 text-[16px] font-bold text-slate-900 shadow-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <Spinner className="h-5 w-5" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>
    </div>
  );
}
