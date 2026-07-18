import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

import { ToastProvider } from "@/components/toastProvider";
import { AuthProvider } from "@/components/AuthContext";
import { FirstVisitPopup } from "@/components/FirstVisitAlert";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import ScrollToTop from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "Gadget CITi - Your Trusted Plug for Quality Gadgets",
  description: "Buy quality and trusted gadgets on Gadget CITi - your trusted platform for all phones, laptop and accessories - gadgets.",
  twitter: {
    card: "summary_large_image",
    title: "Gadget CITi - Your Trusted Plug for Quality Gadgets",
    description: "buy quality and trusted gadget on gadgetciti - your trusted platform for recycling and selling used items.",
    images: "https://res.cloudinary.com/dzj8q4qtf/image/upload/v1700000000/recyco-twitter-card_ojl5n9.png",
  },
  openGraph: {
    title: "Gadget CITi - Your Trusted Plug for Quality Gadgets",
    description: "Buy quality and trusted gadgets on Gadget CITi - your trusted platform for all phones, laptop and accessories - gadgets.",
    url: "https://www.gadgetciti.com",
    siteName: "Gadget CITi",
    images: [
      {
        url: "https://res.cloudinary.com/dzj8q4qtf/image/upload/v1700000000/recyco-og-image_ajh7xk.png",
        width: 1200,
        height: 630,
        alt: "Gadget CITi - Your Trusted Plug for Quality Gadgets",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },




};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${outfit.variable} font-sans bg-slate-50 overflow-x-hidden min-h-screen`}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <ScrollToTop />
                {children}
                <FirstVisitPopup />
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
