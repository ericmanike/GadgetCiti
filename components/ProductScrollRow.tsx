'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/products';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductScrollRowProps {
  products: Product[];
}

export default function ProductScrollRow({ products }: ProductScrollRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = () => {
    const el = containerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const showLeft = el.scrollLeft > 5;
    const showRight = el.scrollLeft < maxScroll - 5;

    setCanScrollLeft((prev) => (prev !== showLeft ? showLeft : prev));
    setCanScrollRight((prev) => (prev !== showRight ? showRight : prev));
  };

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.75;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, [products]);

  if (!products || products.length === 0) return null;

  return (
    <div className="relative group/row w-full">
      {/* Left Arrow Button */}
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByAmount('left')}
          className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center h-9 w-9 md:h-10 md:w-10 rounded-full bg-[#FF6900] text-white shadow-xl hover:bg-[#e05d00] hover:scale-110 active:scale-95 transition-all duration-300 opacity-0 group-hover/row:opacity-100 pointer-events-none group-hover/row:pointer-events-auto"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </button>
      )}

      {/* Product Scroll Container */}
      <div
        ref={containerRef}
        onScroll={checkScrollPosition}
        className="flex gap-4 overflow-x-auto no-scrollbar py-2 select-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {products.map((product) => (
          <div key={product.id} className="w-[190px] sm:w-[200px] md:w-[240px] shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Right Arrow Button */}
      {canScrollRight && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByAmount('right')}
          className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center h-9 w-9 md:h-10 md:w-10 rounded-full bg-[#FF6900] text-white shadow-xl hover:bg-[#e05d00] hover:scale-110 active:scale-95 transition-all duration-300 opacity-0 group-hover/row:opacity-100 pointer-events-none group-hover/row:pointer-events-auto"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </button>
      )}
    </div>
  );
}
