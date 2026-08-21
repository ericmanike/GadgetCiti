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
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || products.length === 0) return;

    let isVisible = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    let animationFrameId: number;

    const scroll = () => {
      if (el && isVisible && !isHoveredRef.current) {
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
          el.scrollLeft = 0;
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
  }, [products, speed]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className="flex gap-4 overflow-x-auto no-scrollbar py-2 select-none"
    >
      {products.map((product) => (
        <div key={product.id} className="w-[190px] sm:w-[200px] md:w-[240px]  shrink-0">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
