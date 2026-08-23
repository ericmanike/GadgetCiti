'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/products';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AutoScrollProductRowProps {
  products: Product[];
  speed?: number;
}

export default function AutoScrollProductRow({ products, speed = 0.8 }: AutoScrollProductRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const isInteractingRef = useRef(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    isInteractingRef.current = isInteracting;
  }, [isInteracting]);

  const handleInteractionStart = () => {
    setIsInteracting(true);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
  };

  const handleInteractionEnd = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    // Auto-resume auto-scrolling 2.5 seconds after touch/interaction ends
    resumeTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 2500);
  };

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
    handleInteractionStart();
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.75;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
    handleInteractionEnd();
  };

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, [products]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || products.length === 0) return;

    let isVisible = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    let animationFrameId: number;

    const scroll = () => {
      if (el && isVisible && !isInteractingRef.current) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft < maxScroll - 0.5) {
          el.scrollLeft += speed;
          checkScrollPosition();
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [products, speed]);

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
        onMouseEnter={handleInteractionStart}
        onMouseLeave={handleInteractionEnd}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        onTouchCancel={handleInteractionEnd}
        onScroll={() => {
          checkScrollPosition();
        }}
        className="flex gap-4 overflow-x-auto no-scrollbar py-2 select-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {products.map((product, idx) => (
          <div key={`${product.id}-${idx}`} className="w-[190px] sm:w-[200px] md:w-[240px] shrink-0">
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

