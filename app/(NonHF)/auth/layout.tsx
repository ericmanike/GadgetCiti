import React from "react";
import Link from "next/link";
import { RadioTower, ArrowRight, HelpCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login/Signup - Gadget's CITi",
  description: "Sign in or create a free account with Gadget's CITi. Start your mobile data agent business or buy bundles directly.",
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#f4f6f8] px-4 py-10 font-sans antialiased text-slate-800">
   

  

    
      <div className="w-full max-w-[430px]">
        {children}
      </div>

      {/* 4. Footer */}
      <div className="mt-6 flex flex-col items-center gap-3.5 text-center text-xs">
        <Link
          href="/help"
          className="inline-flex items-center gap-1.5 font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          <HelpCircle className="h-4 w-4 text-slate-400" strokeWidth={2} />
          Need help? Watch how to log in
        </Link>
        <span className="text-[11px] text-slate-400 font-medium">
          © {new Date().getFullYear()} Gadget's CITi
        </span>
      </div>
    </div>
  );
}
