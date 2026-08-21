'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/products';

interface AutoScrollProductRowProps {
  products: Product[];
  speed?: number;
}

export default function AutoScrollProductRow({ products, speed = 0.8 }: AutoScrollProductRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const isInteractingRef = useRef(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

  // Duplicate items to ensure seamless infinite looping without flickering back to start
  const repeatCount = products.length > 0 && products.length < 8 ? 4 : 3;
  const displayProducts = Array.from({ length: repeatCount }, () => products).flat();

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
        const singleSetWidth = el.scrollWidth / repeatCount;
        if (singleSetWidth > 0 && el.scrollLeft >= singleSetWidth) {
          // Seamlessly reset by 1 set length - 0px visual jump or flicker!
          el.scrollLeft -= singleSetWidth;
        } else {
          el.scrollLeft += speed;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [products, speed, repeatCount]);

  if (!products || products.length === 0) return null;

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      onTouchCancel={handleInteractionEnd}
      onScroll={() => {
        const el = containerRef.current;
        if (!el) return;
        const singleSetWidth = el.scrollWidth / repeatCount;
        if (singleSetWidth > 0) {
          if (el.scrollLeft >= singleSetWidth * (repeatCount - 1)) {
            el.scrollLeft -= singleSetWidth;
          } else if (el.scrollLeft <= 0) {
            el.scrollLeft += singleSetWidth;
          }
        }
        if (isInteractingRef.current) {
          handleInteractionStart();
          handleInteractionEnd();
        }
      }}
      className="flex gap-4 overflow-x-auto no-scrollbar py-2 select-none touch-pan-x"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {displayProducts.map((product, idx) => (
        <div key={`${product.id}-${idx}`} className="w-[190px] sm:w-[200px] md:w-[240px] shrink-0">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}

