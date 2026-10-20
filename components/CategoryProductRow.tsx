"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Product } from "@/lib/products";
import { CategoryProductCard } from "@/components/CategoryProductCard";

interface CategoryProductRowProps {
  /** Category row title (e.g., "Accessories", "Smartphones", "Computers") */
  title: string;
  /** Category slug used for View All URL */
  slug?: string;
  /** Custom View All link (overrides default /buy?category=...) */
  viewAllHref?: string;
  /** Products belonging to this category */
  products: Product[];
  /** Optional subtitle or description */
  subtitle?: string;
  /** Card aspect ratio (default: "aspect-[3/4]") */
  cardAspectRatio?: string;
  /** Custom extra styling */
  className?: string;
}

export function CategoryProductRow({
  title,
  slug,
  viewAllHref,
  products,
  subtitle,
  cardAspectRatio = "aspect-[3/4]",
  className = "",
}: CategoryProductRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const targetLink =
    viewAllHref ||
    `/buy?category=${encodeURIComponent(slug || title.toLowerCase().trim())}`;

  // Check scroll position to dynamically show/hide scroll arrows
  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < maxScroll - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [products]);

  const scrollByAmount = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const scrollAmount = containerRef.current.clientWidth * 0.75;
    containerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) {
    return null;
  }

  // Capitalize title cleanly
  const formattedTitle = title
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
    .join(" ");

  return (
    <section className={`w-full group/row relative space-y-3.5 ${className}`}>
      {/* Category Row Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 md:h-7 rounded-full bg-orange-500 shrink-0" />
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">
                {formattedTitle}
              </h2>
              <span className="text-xs md:text-sm font-semibold text-slate-400">
                ({products.length})
              </span>
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right Header: View All Link & Desktop Scroll Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={targetLink}
            className="text-orange-500 hover:text-orange-600 font-bold text-xs sm:text-sm md:text-base flex items-center gap-1 hover:translate-x-0.5 transition-transform group/link select-none whitespace-nowrap"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover/link:translate-x-1" />
          </Link>

          {/* Desktop Arrow Controls */}
          <div className="hidden sm:flex items-center gap-1 ml-1">
            <button
              type="button"
              aria-label="Scroll left"
              disabled={!canScrollLeft}
              onClick={() => scrollByAmount("left")}
              className={`p-1.5 rounded-full border transition-all ${
                canScrollLeft
                  ? "border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 cursor-pointer active:scale-95"
                  : "border-slate-200 text-slate-300 cursor-not-allowed opacity-40"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              disabled={!canScrollRight}
              onClick={() => scrollByAmount("right")}
              className={`p-1.5 rounded-full border transition-all ${
                canScrollRight
                  ? "border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 cursor-pointer active:scale-95"
                  : "border-slate-200 text-slate-300 cursor-not-allowed opacity-40"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Respective Products Row Container */}
      <div className="relative">
        {/* Floating Left Scroll Button (on hover) */}
        {canScrollLeft && (
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollByAmount("left")}
            className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 items-center justify-center h-10 w-10 rounded-full bg-white/95 text-slate-800 shadow-xl border border-slate-200/80 hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Floating Right Scroll Button (on hover) */}
        {canScrollRight && (
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollByAmount("right")}
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 items-center justify-center h-10 w-10 rounded-full bg-white/95 text-slate-800 shadow-xl border border-slate-200/80 hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Scrollable Products List */}
        <div
          ref={containerRef}
          onScroll={checkScroll}
          className="flex gap-3.5 sm:gap-4 md:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5 select-none"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {products.map((product) => (
            <div
              key={product.id || product.slug}
              className="w-[190px] sm:w-[220px] md:w-[250px] lg:w-[270px] shrink-0"
            >
              <CategoryProductCard
               
                product={product}
                aspectRatio={cardAspectRatio}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryProductRow;
