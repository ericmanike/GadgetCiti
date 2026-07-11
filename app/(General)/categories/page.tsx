"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Laptop, 
  Printer, 
  Smartphone, 
  Network, 
  Tablet, 
  Cpu, 
  Headphones, 
  Gamepad2, 
  ChevronRight,
  ArrowRight
} from "lucide-react";
import Pattern from "@/components/ui/Pattern";

const CATEGORIES = [
  {
    title: "Laptops & Computations",
    desc: "Premium workstations, ultrabooks, and customized gaming rigs.",
    query: "laptops",
    imageUrl: "/cat_laptops.png",
    fallbackUrl: "/L1.jpg",
    icon: Laptop,
    span: "md:col-span-2",
    height: "h-[320px] md:h-[400px]",
    gradient: "from-blue-600/90 to-cyan-500/90",
    badge: "New Models",
    itemCount: 42,
  },
  {
    title: "Smartphones & iPhones",
    desc: "Flagship devices, iOS and Android platforms.",
    query: "iphones",
    imageUrl: "/cat_smartphones.png",
    fallbackUrl: "/p2.jpg",
    icon: Smartphone,
    span: "md:col-span-1",
    height: "h-[360px] md:h-[480px]",
    gradient: "from-rose-600/90 to-orange-500/90",
    badge: "Trending",
    itemCount: 28,
  },
  {
    title: "Printers & Office Gear",
    desc: "Reliable lasers, smart inkjets, and high-speed scanner units.",
    query: "printers",
    imageUrl: "/cat_printers.png",
    fallbackUrl: "/printers",
    icon: Printer,
    span: "md:col-span-1",
    height: "h-[280px] md:h-[340px]",
    gradient: "from-slate-700/90 to-zinc-600/90",
    badge: "Refurbished",
    itemCount: 15,
  },
  {
    title: "Tablets & iPads",
    desc: "Versatile screens for creators, students, and professionals.",
    query: "tablets",
    imageUrl: "/cat_tablets.png",
    fallbackUrl: "/tb1.jpg",
    icon: Tablet,
    span: "md:col-span-2",
    height: "h-[300px] md:h-[380px]",
    gradient: "from-violet-600/90 to-fuchsia-500/90",
    badge: "Popular",
    itemCount: 19,
  },
  {
    title: "Computers & Hardware",
    desc: "Enterprise networking, switches, firewalls, and server racks.",
    query: "hardware & IT infrastructure",
    imageUrl: "/cat_hardware.png",
    fallbackUrl: "/hardware.jpg",
    icon: Network,
    span: "md:col-span-2",
    height: "h-[320px] md:h-[440px]",
    gradient: "from-emerald-600/90 to-teal-500/90",
    badge: "Enterprise",
    itemCount: 31,
  },
  {
    title: "Accessories & Peripherals",
    desc: "Mechanical keyboards, ergonomic mice, and hubs.",
    query: "accessories",
    imageUrl: "/cat_accessories.png",
    fallbackUrl: "/access.jpg",
    icon: Cpu,
    span: "md:col-span-1",
    height: "h-[280px] md:h-[360px]",
    gradient: "from-neutral-800/95 to-neutral-700/90",
    badge: "Best Seller",
    itemCount: 65,
  },
  {
    title: "Audio & Acoustics",
    desc: "Active noise cancelling headphones, studio monitors.",
    query: "audio",
    imageUrl: "/cat_audio.png",
    fallbackUrl: "/access.jpg",
    icon: Headphones,
    span: "md:col-span-1",
    height: "h-[300px] md:h-[380px]",
    gradient: "from-pink-600/90 to-rose-500/90",
    badge: "Hi-Res",
    itemCount: 22,
  },
  {
    title: "Gaming Gears",
    desc: "Console accessories, gaming pads, and lighting setups.",
    query: "gaming",
    imageUrl: "/cat_gaming.png",
    fallbackUrl: "/access.jpg",
    icon: Gamepad2,
    span: "md:col-span-1",
    height: "h-[320px] md:h-[420px]",
    gradient: "from-lime-600/90 to-emerald-500/95",
    badge: "Low Latency",
    itemCount: 24,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
};

export default function CategoriesPage() {
  return (
    <main className="w-full bg-slate-50 min-h-screen pt-28 pb-24 overflow-x-hidden relative">
      <Pattern />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Decorative Blurred Glowing Blob */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-tr from-orange-400/10 to-amber-400/10 rounded-full blur-3xl pointer-events-none z-0" />

        {/* Page Header */}
        <div className="mb-14 md:mb-20 text-center max-w-2xl mx-auto space-y-5 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-orange-500/20 text-orange-600 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-xs shadow-orange-500/5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
            Explore Departments
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight"
          >
            Browse by{" "}
            <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              Category
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-xl mx-auto"
          >
            Select a specialized technology division below to find curated devices, specs, and tailored accessories.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-16 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mx-auto"
          />
        </div>

        {/* Asymmetrical Masonry Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 items-start"
        >
          {CATEGORIES.map((cat, idx) => {
            const IconComponent = cat.icon;
            
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`${cat.span} group flex flex-col gap-4 bg-white p-4 rounded-3xl border border-slate-200/60 shadow-xs hover:shadow-md transition-all duration-300`}
              >
                {/* Image Wrapper */}
                <div className="relative w-full h-[220px] md:h-[260px] rounded-2xl overflow-hidden bg-slate-100">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={idx < 3}
                  />
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
                </div>
                
                {/* Text Content Underneath */}
                <div className="flex flex-col flex-1 justify-between gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest block">
                      {cat.itemCount} Products Available
                    </span>
                    <h3 className="text-lg md:text-xl font-extrabold text-slate-800 group-hover:text-orange-500 transition-colors leading-tight">
                      {cat.title}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">
                      {cat.desc}
                    </p>
                  </div>

                  <Link
                    href={`/buy?category=${cat.query}`}
                    className="inline-flex items-center justify-center gap-2 w-full bg-slate-50 group-hover:bg-orange-500 text-slate-700 group-hover:text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-all duration-300 group/btn active:scale-[0.98]"
                  >
                    Shop Department
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-transform group-hover/btn:translate-x-1" strokeWidth={2.5} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        
      </div>
    </main>
  );
}
