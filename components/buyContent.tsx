'use client';
import { motion } from "framer-motion";
import { Filter } from "lucide-react";
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
    category: '',
    priceRange: '',
    location: '',
    condition: '',
  });
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get("category") || "All";
  const priceRange = searchParams.get("priceRange") || "All";


  const categoryFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", value);
    router.push(`?${params.toString()}`);
  };

  const priceRangeFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("priceRange", value);
    router.push(`?${params.toString()}`);
  };


  const locationFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("location", value);
    router.push(`?${params.toString()}`);
  };

  const handleConditionChange = (condition: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("condition", condition);
    router.push(`?${params.toString()}`);
  }



  useEffect(() => {
    console.log("Filters updated:", { category, priceRange });
  }, [category, priceRange]);

  useEffect(() => {
    setLoading(true);
    fetchAllProducts().then((products) => {
      setAllProducts(products);
      setLoading(false);
    });
  }, []);



  return (
    <div className="flex min-h-screen font-sans w-full md:mt-30 mt-15 bg-gray-50">

      <div className="grid  grid-cols-1 md:grid-cols-[0.4fr_1fr] py-10 relative ">
        <div className=" ">


          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden bg-white text-gray-900 border border-gray-200 py-3 px-6 rounded-2xl w-fit min-w-[140px] mx-auto flex items-center justify-center gap-2 mb-8 shadow-sm active:scale-95 transition-all"
          >
            <Filter size={18} className="text-blue-500" />
            <span className="font-bold text-sm">Filters</span>
          </button>

          <div className={`md:block ${isFilterOpen ? 'block' : 'hidden'} bg-white space-y-8 text-gray-900 p-6 m-3 rounded-[2rem] shadow-lg z-40 transition-all duration-300`}>
            <h2 className="text-xl font-bold mb-4 flex justify-between w-full ">
              <span>Filters</span><button className="text-red-500 text-xs font-bold hover:underline cursor-pointer"
                onClick={() => {
                  setFilteredProducts({ category: '', priceRange: '', location: '', condition: '' });
                  router.push('?');
                }}>
                Clear all
              </button></h2>
            <div className="mb-6">
              <label className="block mb-3 font-bold text-base text-gray-900 border-b border-gray-100 pb-1">Category</label>
              <div className="space-y-2.5">
                {[
                  { id: 'all', label: 'All Categories', value: '' },
                  { id: 'phones', label: 'Smartphones', value: 'phones' },
                  { id: 'laptops', label: 'Laptops', value: 'laptops' },
                  { id: 'tablets', label: 'Tablets', value: 'tablets' },
                  { id: 'accessories', label: 'Accessories', value: 'accessories' },
                  { id: 'electronics', label: 'Other Electronics', value: 'electronics' },
                ].map((cat) => (
                  <label key={cat.id} className="flex items-center group cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        checked={filteredProducts.category === cat.value}
                        onChange={(e) => {
                          setFilteredProducts(prev => ({ ...prev, category: e.target.value }));
                          categoryFilter(e.target.value);
                        }}
                        className="appearance-none w-5 h-5 border-2 border-gray-200 rounded-full checked:border-orange-500 transition-all cursor-pointer"
                      />
                      {filteredProducts.category === cat.value && (
                        <div className="absolute w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-600 group-hover:text-orange-500 transition-colors">
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
                <span className="text-orange-500 text-xs font-black">Up to {formatCurrency(Number(filteredProducts.priceRange) || 5000)}</span>
              </label>
              <div className="px-1">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={filteredProducts.priceRange || '5000'}
                  onChange={(e) => {
                    setFilteredProducts(prev => ({ ...prev, priceRange: e.target.value }));
                    priceRangeFilter(e.target.value);
                  }}
                  style={{
                    background: `linear-gradient(to right, #f97316 0%, #f97316 ${((Number(filteredProducts.priceRange || 5000) / 5000) * 100)}%, #e5e7eb ${((Number(filteredProducts.priceRange || 5000) / 5000) * 100)}%, #e5e7eb 100%)`
                  }}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-orange-500 [&::-moz-range-thumb]:border-none"
                />
                <div className="flex justify-between mt-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <span>0 GHS</span>
                  <span>2.5K</span>
                  <span>5K GHS</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mb-6">
              <label className="block mb-3 font-bold text-base text-gray-900 border-b border-gray-100 pb-1">Location</label>
              <div className="space-y-2.5">
                {[
                  { id: 'l-all', label: 'All Locations', value: '' },
                  { id: 'l-accra', label: 'Accra', value: 'accra' },
                  { id: 'l-kumasi', label: 'Kumasi', value: 'kumasi' },
                  { id: 'l-takoradi', label: 'Takoradi', value: 'takoradi' },
                  { id: 'l-tamale', label: 'Tamale', value: 'tamale' },
                ].map((loc) => (
                  <label key={loc.id} className="flex items-center group cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="location"
                        value={loc.value}
                        checked={filteredProducts.location === loc.value}
                        onChange={(e) => {
                          setFilteredProducts(prev => ({ ...prev, location: e.target.value }));
                          locationFilter(e.target.value);
                        }}
                        className="appearance-none w-5 h-5 border-2 border-gray-200 rounded-full checked:border-orange-500 transition-all cursor-pointer"
                      />
                      {filteredProducts.location === loc.value && (
                        <div className="absolute w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-600 group-hover:text-orange-500 transition-colors">
                      {loc.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-3 font-bold text-base text-gray-900 border-b border-gray-100 pb-1">Condition</label>
              <div className="space-y-3">
                {[
                  { id: 'c-all', label: 'All Conditions', value: '' },
                  { id: 'c-new', label: 'New', value: 'new' },
                  { id: 'c-used', label: 'Used / Pre-owned', value: 'used' },
                  { id: 'c-refurbished', label: 'Refurbished', value: 'refurbished' },
                ].map((cond) => (
                  <label key={cond.id} className="flex items-center group cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="condition"
                        value={cond.value}
                        checked={filteredProducts.condition === cond.value}
                        onChange={(e) => {
                          setFilteredProducts(prev => ({ ...prev, condition: e.target.value }));
                          handleConditionChange(e.target.value);
                        }}
                        className="appearance-none w-5 h-5 border-2 border-gray-200 rounded-full checked:border-orange-500 transition-all cursor-pointer"
                      />
                      {filteredProducts.condition === cond.value && (
                        <div className="absolute w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-600 group-hover:text-orange-500 transition-colors">
                      {cond.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>


          </div>
          {/*  Slider   */}




        </div >
        <div className="flex-1 p-2 md:p-4 overflow-hidden w-full">
          {loading ? (
            <SkeletonCards cols={4} rows={2} />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 justify-items-center">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>




      </div>



    </div>
  );
}
