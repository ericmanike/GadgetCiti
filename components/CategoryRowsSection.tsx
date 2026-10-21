"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product, fetchCategories, DBCategory } from "@/lib/products";
import { CategoryProductRow } from "@/components/CategoryProductRow";
import SkeletonCards from "@/components/SkeletonCards";

interface CategoryRowsSectionProps {
  products: Product[];
  loading?: boolean;
  className?: string;
}

interface CategoryGroup {
  id: string | number;
  name: string;
  slug: string;
  products: Product[];
}

export function CategoryRowsSection({
  products = [],
  loading = false,
  className = "",
}: CategoryRowsSectionProps) {
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [fetchingCats, setFetchingCats] = useState(true);

  // Fetch all categories from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    fetchCategories().then((cats) => {
      if (isMounted) {
        setCategories(cats);
        setFetchingCats(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Group products by category
  const categoryGroups = useMemo<CategoryGroup[]>(() => {
    if (!products || products.length === 0) return [];

    // Map categories from DB first
    const matchedCategoryIds = new Set<string | number>();
    const groups: CategoryGroup[] = [];

    if (categories.length > 0) {
      categories.forEach((cat) => {
        const catNameLower = cat.name.toLowerCase().trim();
        const catSlugLower = cat.slug.toLowerCase().trim();

        const catProducts = products.filter((p) => {
          const pCat = (p.category || "").toLowerCase().trim();
          const pCatSlug = (p.categorySlug || "").toLowerCase().trim();
          return (
            pCat === catNameLower ||
            pCatSlug === catSlugLower ||
            pCat.includes(catNameLower) ||
            catNameLower.includes(pCat)
          );
        });

        if (catProducts.length > 0) {
          groups.push({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            products: catProducts,
          });
          matchedCategoryIds.add(cat.id);
        }
      });
    }

    // Also collect any products with categories not in the categories table
    const productsInGroups = new Set(groups.flatMap((g) => g.products.map((p) => p.id)));
    const remainingProducts = products.filter((p) => !productsInGroups.has(p.id));

    if (remainingProducts.length > 0) {
      // Group remaining by their product.category string
      const remainderMap: Record<string, Product[]> = {};
      remainingProducts.forEach((p) => {
        const catKey = p.category || "Other Tech";
        if (!remainderMap[catKey]) remainderMap[catKey] = [];
        remainderMap[catKey].push(p);
      });

      Object.entries(remainderMap).forEach(([catName, prods]) => {
        groups.push({
          id: `custom-${catName}`,
          name: catName,
          slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          products: prods,
        });
      });
    }

    // Put the row with more products first
    groups.sort((a, b) => b.products.length - a.products.length);

    return groups;
  }, [products, categories]);

  const isLoading = loading || (fetchingCats && products.length === 0);

  if (isLoading) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="space-y-4">
          <div className="h-6 w-48 bg-slate-200 rounded-md animate-pulse" />
          <SkeletonCards cols={4} rows={1} />
        </div>
      </div>
    );
  }

  if (categoryGroups.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-10 md:space-y-12 ${className}`}>
      {categoryGroups.map((group) => (
        <CategoryProductRow
          key={group.id}
          title={group.name}
          slug={group.slug}
          products={group.products}
        />
      ))}

      {/* Centered Explore More Button */}
      <div className="flex justify-center pt-8 md:pt-14 pb-4 md:pb-8">
        <Link
          href="/buy"
          className="
            group/btn relative inline-flex items-center justify-center gap-3.5 
            px-8 md:px-10 py-3.5 md:py-4 
            bg-orange-500 hover:bg-orange-600
            text-white rounded-full
            font-black text-sm md:text-base uppercase tracking-wider
            transition-all duration-300 shadow-lg shadow-orange-500/25
            hover:shadow-xl hover:shadow-orange-500/35
            hover:scale-[1.02] active:scale-[0.98]
            cursor-pointer select-none"
        >
          <span className="font-black tracking-widest">Explore More</span>
          <ArrowRight className="relative z-10 w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>
    </div>
  );
}

export default CategoryRowsSection;
