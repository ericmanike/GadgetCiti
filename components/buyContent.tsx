'use client';
import { motion } from "framer-motion";
import { Filter, Check, X, ScanSearch } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "./ProductCard";
import { formatCurrency } from "@/lib/utils";
import SkeletonCards from "./SkeletonCards";

import { fetchAllProducts, Product } from "@/lib/products";

export default function BuyPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState({
    categories: [] as string[],
    priceRange: '',
    brands: [] as string[],
    conditions: [] as string[],
  });
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = searchParams.get("category") || "";
  const priceRange = searchParams.get("priceRange") || "";
  const brandParam = searchParams.get("brand") || "";
  const conditionParam = searchParams.get("condition") || "";

  const selectedCategories = categoryParam ? categoryParam.split(",") : [];
  const selectedBrands = brandParam ? brandParam.split(",") : [];
  const selectedConditions = conditionParam ? conditionParam.split(",") : [];

  const categoryFilter = (values: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (values.length > 0) {
      params.set("category", values.join(","));
    } else {
      params.delete("category");
    }
    router.push(`?${params.toString()}`);
  };

  const priceRangeFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("priceRange", value);
    router.push(`?${params.toString()}`);
  };

  const brandFilter = (values: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (values.length > 0) {
      params.set("brand", values.join(","));
    } else {
      params.delete("brand");
    }
    router.push(`?${params.toString()}`);
  };

  const handleConditionChange = (values: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (values.length > 0) {
      params.set("condition", values.join(","));
    } else {
      params.delete("condition");
    }
    router.push(`?${params.toString()}`);
  }

  useEffect(() => {
    setLoading(true);
    fetchAllProducts().then((products) => {
      setAllProducts(products);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setFilteredProducts({
      categories: selectedCategories,
      priceRange,
      brands: selectedBrands,
      conditions: selectedConditions,
    });

    let updated = [...allProducts];

    // Filter by categories
    if (selectedCategories.length > 0) {
      updated = updated.filter(p => selectedCategories.some(cat => p.category?.toLowerCase() === cat.toLowerCase()));
    }

    // Filter by price range
    if (priceRange && priceRange !== 'All') {
      const maxPrice = Number(priceRange);
      if (!isNaN(maxPrice)) {
        updated = updated.filter(p => p.price <= maxPrice);
      }
    }

    // Filter by brands
    if (selectedBrands.length > 0) {
      updated = updated.filter(p => selectedBrands.some(b => p.brand?.toLowerCase() === b.toLowerCase()));
    }

    // Filter by condition
    if (selectedConditions.length > 0) {
      updated = updated.filter(p => {
        const specStr = p.specifications?.map(s => `${s.label} ${s.value}`).join(' ').toLowerCase() || '';
        const descStr = p.description?.toLowerCase() || '';
        return selectedConditions.some(cond => specStr.includes(cond.toLowerCase()) || descStr.includes(cond.toLowerCase()));
      });
    }

    // Sort products
    if (sortBy === 'price-asc') {
      updated.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      updated.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      updated.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      updated.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    } else {
      // popularity
      updated.sort((a, b) => b.ratingCount - a.ratingCount);
    }

    setDisplayProducts(updated);
  }, [allProducts, categoryParam, priceRange, brandParam, conditionParam, sortBy]);

  return (
    <div className="min-h-screen font-sans w-full md:mt-30 mt-15 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-10 w-full max-w-7xl mx-auto px-4 md:px-6 relative">
        <div className="md:sticky md:top-36 h-fit flex-shrink-0">
          {/* Mobile Backdrop */}
          {isFilterOpen && (
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 md:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
          )}


          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden bg-white text-gray-900 border border-gray-200 py-3 px-6 rounded-2xl w-fit min-w-[140px] mx-auto flex items-center justify-center gap-2 mb-8 shadow-sm active:scale-95 transition-all"
          >
            <Filter size={18} className="text-blue-500" />
            <span className="font-bold text-sm">Filters</span>
          </button>

          <div 
            className={`
              bg-white text-gray-900 p-6 shadow-lg z-[60] transition-all duration-300 md:max-h-[70vh] overflow-y-auto thin-scrollbar
              ${isFilterOpen 
                ? 'fixed inset-x-4 top-28 bottom-6 max-h-[75vh] block rounded-[20px] border border-gray-150 space-y-6' 
                : 'hidden md:block md:relative md:space-y-6 md:m-3 md:rounded-[5px]'
              }
            `}
          >
            <h2 className="text-xl font-bold mb-4 flex justify-between w-full items-center">
              <span>Filters</span>
              <div className="flex items-center gap-3">
                <button className="text-red-500 text-xs font-bold hover:underline cursor-pointer"
                  onClick={() => {
                    setFilteredProducts({ categories: [], priceRange: '', brands: [], conditions: [] });
                    router.push('?');
                  }}>
                  Reset all
                </button>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="md:hidden p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </h2>
            <div className="mb-6">
              <label className="block mb-3 font-bold text-base text-gray-900 border-b border-gray-100 pb-1">Category</label>
              <div className="space-y-2.5">
                {[
                  { id: 'smartphones', label: 'Smartphones', value: 'smartphones' },
                  { id: 'computers', label: 'Computers', value: 'computers' },
                  { id: 'tablets', label: 'Tablets & Ipad', value: 'tablets' },
                  { id: 'accessories', label: 'Accessories', value: 'accessories' },
                  { id: 'electronics', label: 'Other Electronics', value: 'electronics' },
                ].map((cat) => (
                  <label key={cat.id} className="flex items-center group cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        value={cat.value}
                        checked={filteredProducts.categories.includes(cat.value)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          const newCategories = isChecked
                            ? [...filteredProducts.categories, cat.value]
                            : filteredProducts.categories.filter(c => c !== cat.value);
                          setFilteredProducts(prev => ({ ...prev, categories: newCategories }));
                          categoryFilter(newCategories);
                        }}
                        className="appearance-none w-5 h-5 border-2 border-gray-200 rounded-md checked:border-orange-500 checked:bg-orange-500 transition-all cursor-pointer flex items-center justify-center"
                      />
                      {filteredProducts.categories.includes(cat.value) && (
                        <Check size={12} className="absolute text-white pointer-events-none" strokeWidth={4} />
                      )}
                    </div>
                    <span className="ml-3 text-sm font-semibold text-gray-600 group-hover:text-orange-500 transition-colors">
                      {cat.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {/* Price Range Slider */}
            <div className="mb-8">
              <label className="block mb-4 font-bold text-base text-gray-900 border-b border-gray-100 pb-1 flex justify-between items-center">
                Price Range
                <span className="text-orange-500 text-xs font-black">Up to {formatCurrency(Number(filteredProducts.priceRange) || 25000)}</span>
              </label>
              <div className="px-1">
                <input
                  type="range"
                  min="0"
                  max="25000"
                  step="50"
                  value={filteredProducts.priceRange || '25000'}
                  onChange={(e) => {
                    setFilteredProducts(prev => ({ ...prev, priceRange: e.target.value }));
                    priceRangeFilter(e.target.value);
                  }}
                  style={{
                    background: `linear-gradient(to right, #f97316 0%, #f97316 ${((Number(filteredProducts.priceRange || 25000) / 25000) * 100)}%, #e5e7eb ${((Number(filteredProducts.priceRange || 25000) / 25000) * 100)}%, #e5e7eb 100%)`
                  }}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-orange-500 [&::-moz-range-thumb]:border-none"
                />
                <div className="flex justify-between mt-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <span>0 GHS</span>
                  <span>25K GHS</span>
                </div>
              </div>
            </div>

            {/* Brand Filter */}
            <div className="mb-6">
              <label className="block mb-3 font-bold text-base text-gray-900 border-b border-gray-100 pb-1">Brand</label>
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto thin-scrollbar pr-1">
                {Array.from(new Set(allProducts.map(p => p.brand).filter(Boolean))).sort().map((brand) => (
                  <label key={brand} className="flex items-center group cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        value={brand}
                        checked={filteredProducts.brands.includes(brand)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          const newBrands = isChecked
                            ? [...filteredProducts.brands, brand]
                            : filteredProducts.brands.filter(b => b !== brand);
                          setFilteredProducts(prev => ({ ...prev, brands: newBrands }));
                          brandFilter(newBrands);
                        }}
                        className="appearance-none w-5 h-5 border-2 border-gray-200 rounded-md checked:border-orange-500 checked:bg-orange-500 transition-all cursor-pointer flex items-center justify-center"
                      />
                      {filteredProducts.brands.includes(brand) && (
                        <Check size={12} className="absolute text-white pointer-events-none" strokeWidth={4} />
                      )}
                    </div>
                    <span className="ml-3 text-sm font-semibold text-gray-600 group-hover:text-orange-500 transition-colors">
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </div>



            <div className="mb-6">
              <label className="block mb-3 font-bold text-base text-gray-900 border-b border-gray-100 pb-1">Condition</label>
              <div className="space-y-3">
                {[
                  { id: 'c-new', label: 'New', value: 'new' },
                  { id: 'c-used', label: 'Used / Pre-owned', value: 'used' },
                  { id: 'c-refurbished', label: 'Refurbished', value: 'refurbished' },
                ].map((cond) => (
                  <label key={cond.id} className="flex items-center group cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        value={cond.value}
                        checked={filteredProducts.conditions.includes(cond.value)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          const newConditions = isChecked
                            ? [...filteredProducts.conditions, cond.value]
                            : filteredProducts.conditions.filter(c => c !== cond.value);
                          setFilteredProducts(prev => ({ ...prev, conditions: newConditions }));
                          handleConditionChange(newConditions);
                        }}
                        className="appearance-none w-5 h-5 border-2 border-gray-200 rounded-md checked:border-orange-500 checked:bg-orange-500 transition-all cursor-pointer flex items-center justify-center"
                      />
                      {filteredProducts.conditions.includes(cond.value) && (
                        <Check size={12} className="absolute text-white pointer-events-none" strokeWidth={4} />
                      )}
                    </div>
                    <span className="ml-3 text-sm font-semibold text-gray-600 group-hover:text-orange-500 transition-colors">
                      {cond.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mobile Footer Actions */}
            <div className="md:hidden pt-4 border-t border-gray-150 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setFilteredProducts({ categories: [], priceRange: '', brands: [], conditions: [] });
                  router.push('?');
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-250 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer active:scale-98"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white transition cursor-pointer active:scale-98 flex items-center justify-center gap-1.5 shadow-sm"
              >
               
                Apply All
              </button>
            </div>
          </div>
          {/*  Slider   */}




        </div>
        <div className="flex-1 p-2 md:p-4 overflow-hidden w-full flex flex-col gap-4">
          {!loading && (
            <div className="flex items-center justify-between px-2 mb-2 w-full">
              <span className="flex flex-row gap-1">
                 < Filter onClick={()=>setIsFilterOpen(!isFilterOpen)}  className="md:hidden"/> 
                  <span className="md:hidden">filter</span> 
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className=" border-gray-800 bg-white border border-gray-255 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-gray-800 cursor-pointer shadow-xs transition"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          )}

          {loading ? (
            <SkeletonCards cols={4} rows={2} />
          ) : (
            displayProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 justify-items-center w-full">
                {displayProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center w-full gap-4">
                <ScanSearch size={48} className="text-gray-300 stroke-[1.5]" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No products found matching filters</p>
              </div>
            )
          )}
        </div>




      </div>



    </div>
  );
}
