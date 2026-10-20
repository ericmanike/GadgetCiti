"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Product } from "@/lib/products";
import { CategoryProductCard } from "@/components/CategoryProductCard";
import SkeletonCards from "@/components/SkeletonCards";

interface CategoryTab {
  id: string;
  label: string;
  query: string;
  keywords: string[];
}

const CATEGORY_TABS: CategoryTab[] = [
  { id: "all", label: "All Tech", query: "", keywords: [] },
  { id: "smartphones", label: "Smartphones", query: "smartphones", keywords: ["phone", "smartphone", "iphone", "samsung", "pixel"] },
  { id: "computers", label: "Computers", query: "computers", keywords: ["computer", "laptop", "macbook", "desktop", "pc", "workstation"] },
  { id: "tablets", label: "Tablets & iPads", query: "tablets", keywords: ["tablet", "ipad", "tab"] },
  { id: "accessories", label: "Accessories", query: "accessories", keywords: ["accessory", "cable", "charger", "case", "adapter", "watch"] },
  { id: "audio-network", label: "Audio & Network", query: "wifi-network-devices", keywords: ["audio", "headphone", "earphone", "airpod", "speaker", "router", "network", "wifi"] },
];

interface CategoryProductsSectionProps {
  products: Product[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function CategoryProductsSection({
  products = [],
  loading = false,
  title = "Trending Products by Category",
  subtitle = "Discover top-rated smartphones, laptops, and gadgets at unbeatable prices.",
  className = "",
}: CategoryProductsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Filter products based on selected tab
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (activeCategory === "all") return products.slice(0, 8);

    const currentTab = CATEGORY_TABS.find((t) => t.id === activeCategory);
    if (!currentTab) return products.slice(0, 8);

    const matches = products.filter((p) => {
      const cat = (p.category || "").toLowerCase();
      const name = (p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();

      return currentTab.keywords.some(
        (kw) => cat.includes(kw) || name.includes(kw) || desc.includes(kw)
      );
    });

    // If no exact keyword match in DB, fallback to slicing to never show an empty screen
    return matches.length > 0 ? matches.slice(0, 8) : products.slice(0, 4);
  }, [products, activeCategory]);

  const activeTabObj = CATEGORY_TABS.find((t) => t.id === activeCategory) || CATEGORY_TABS[0];
  const targetCategoryLink = activeTabObj.query ? `/buy?category=${activeTabObj.query}` : "/buy";

  return (
    <section className={`w-full space-y-6 ${className}`}>
      {/* Header and Category Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Picks
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight uppercase">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* View All link */}
        <Link
          href={targetCategoryLink}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700 transition group self-start md:self-end"
        >
          <span>Explore all {activeTabObj.label}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Category Pills/Tabs */}
      <div className="flex gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-1 select-none" style={{ WebkitOverflowScrolling: "touch" }}>
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.02]"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <SkeletonCards cols={4} rows={1} />
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <CategoryProductCard
              key={product.id || product.slug}
              product={product}
              aspectRatio="aspect-[3/4]"
            />
          ))}
        </div>
      ) : (
        <div className="w-full py-12 px-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-center">
          <p className="text-slate-600 text-sm font-medium">
            No products found in this category right now.
          </p>
          <Link
            href="/buy"
            className="inline-block mt-3 text-xs font-bold text-orange-500 hover:underline"
          >
            Browse all items in catalog →
          </Link>
        </div>
      )}
    </section>
  );
}

export default CategoryProductsSection;
