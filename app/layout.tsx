import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/Auth_Context";
import { ToastProvider } from "@/components/toastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "ELetronics Mart - Your Trusted Plug for Quality Gadgets",
  description: "Buy quality and trusted gadgets on Letronix - your trusted platform for all phones, laptop and accessories - gadgets.",
  twitter: {
    card: "summary_large_image",
    title: "ELetronics Mart - Your Trusted Plug for Quality Gadgets",
    description: "buy quality and trusted gadget on letronix - your trusted platform for recycling and selling used items.",
    images: "https://res.cloudinary.com/dzj8q4qtf/image/upload/v1700000000/recyco-twitter-card_ojl5n9.png",
  },
  openGraph: {
    title: "ELetronics Mart - Your Trusted Plug for Quality Gadgets",
    description: "Buy quality and trusted gadgets on Letronix - your trusted platform for all phones, laptop and accessories - gadgets.",
    url: "https://www.letro.com",
    siteName: "ELetronics Mart",
    images: [
      {
        url: "https://res.cloudinary.com/dzj8q4qtf/image/upload/v1700000000/recyco-og-image_ajh7xk.png",
        width: 1200,
        height: 630,
        alt: "ELetronics Mart - Your Trusted Plug for Quality Gadgets",
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

      <body className={`${geistSans.variable} font-sans bg-gray-300`}

      >
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
