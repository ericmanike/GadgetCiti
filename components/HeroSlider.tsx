"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

export interface SlideItem {
  id: string | number;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  imageAlt?: string;
}

export interface HeroSliderProps {
  slides: SlideItem[];
  autoplay?: boolean;
  autoplayInterval?: number; // in milliseconds
}

export default function HeroSlider({
  slides,
  autoplay = true,
  autoplayInterval = 5000,
}: HeroSliderProps) {
  const totalSlides = slides ? slides.length : 0;

  // Create extended slides array for seamless infinite looping
  const extendedSlides = totalSlides > 0 ? [slides[totalSlides - 1], ...slides, slides[0]] : [];

  const [current, setCurrent] = useState(1); // Index 1 is the first real slide
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoplay);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle seamless instant wrap-around reset after 500ms transition finishes
  useEffect(() => {
    if (current === 0) {
      // Swiped backwards to clone of last slide -> jump instantly to real last slide
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        setCurrent(totalSlides);
      }, 500);
    } else if (current === totalSlides + 1) {
      // Swiped forwards to clone of first slide -> jump instantly to real first slide
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        setCurrent(1);
      }, 500);
    }

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [current, totalSlides]);

  // Re-enable smooth transition after instant reset
  useEffect(() => {
    if (!isTransitioning) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitioning]);

  // Autoplay interval timer
  useEffect(() => {
    if (isPlaying && totalSlides > 0) {
      timerRef.current = setInterval(() => {
        setCurrent((prev) => prev + 1);
      }, autoplayInterval);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, totalSlides, autoplayInterval]);

  if (!slides || slides.length === 0) {
    return null;
  }

  const restartAutoplayTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (isPlaying && totalSlides > 0) {
      timerRef.current = setInterval(() => {
        setCurrent((prev) => prev + 1);
      }, autoplayInterval);
    }
  };

  const handleNext = () => {
    if (!isTransitioning) return;
    setCurrent((prev) => prev + 1);
    restartAutoplayTimer();
  };

  const handlePrev = () => {
    if (!isTransitioning) return;
    setCurrent((prev) => prev - 1);
    restartAutoplayTimer();
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleDotClick = (index: number) => {
    setIsTransitioning(true);
    setCurrent(index + 1);
    restartAutoplayTimer();
  };

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const minSwipeDistance = 40;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchEndY.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current || !touchStartY.current || !touchEndY.current) return;
    const distanceX = touchStartX.current - touchEndX.current;
    const distanceY = touchStartY.current - touchEndY.current;

    // Only trigger horizontal swipe if horizontal movement is larger than vertical movement
    if (Math.abs(distanceX) > Math.abs(distanceY) && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Calculate real slide index for pagination dots (0 to totalSlides - 1)
  const realIndex = (current - 1 + totalSlides) % totalSlides;

  return (
    <div
      className="relative w-full h-[270px] sm:h-[400px] lg:h-[460px] overflow-hidden bg-white border-b border-slate-100 select-none -mt-4 sm:mt-0 px-3 pt-0 pb-2 sm:p-4 md:p-0 touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Decorative Light Glow Elements */}

      {/* Slides container */}
      <div
        className={`flex w-full h-full ${
          isTransitioning ? "transition-transform duration-500 ease-in-out" : ""
        }`}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {extendedSlides.map((slide, index) => {
          return (
            <div
              key={`${slide.id}-${index}`}
              className="relative w-full h-full flex-none shrink-0"
            >
              {/* Slide Content Layout: Left Text, Right Image */}
              <div className="relative h-full max-w-6xl mx-auto px-4 sm:px-12 flex items-center justify-between z-20 gap-4 sm:gap-6 lg:gap-12">
                {/* Left Text Column */}
                <div className="flex-1 max-w-xl text-left py-2 sm:py-6">
                  <h1 className="text-xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-[1.15]">
                    {slide.title}
                  </h1>
                  <p className="mt-2 sm:mt-5 text-xs sm:text-base text-slate-600 line-clamp-3">
                    {slide.description}
                  </p>
                  <div className="mt-4 sm:mt-10 lg:mt-12">
                    <Link
                      href={slide.ctaLink}
                      className="inline-block bg-[#FF6900] text-white font-bold px-4 py-2.5 sm:px-8 sm:py-3.5 rounded-[5px] hover:bg-orange-600 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-orange-500/25 text-xs sm:text-base"
                    >
                      {slide.ctaText}
                    </Link>
                  </div>
                </div>

                {/* Right Image Column (Framed Image Link with Custom Top-Left & Bottom-Right Rounded Styling) */}
                <Link
                  href={slide.ctaLink}
                  className="relative w-[160px] h-[160px] sm:w-[280px] sm:h-[240px] lg:w-[420px] lg:h-[300px] shrink-0 overflow-hidden rounded-tl-[32px] rounded-br-[32px] sm:rounded-tl-[54px] sm:rounded-br-[54px] rounded-tr-lg rounded-bl-lg border-2 border-slate-200/90 bg-slate-100 shadow-2xl shadow-slate-200/80 group cursor-pointer block transition-all duration-300 hover:border-[#FF6900]/60 hover:shadow-orange-500/15"
                >
                  <Image
                    src={slide.backgroundImage}
                    alt={slide.imageAlt || slide.title}
                    fill
                    priority={index === 1}
                    className="object-cover object-center w-full h-full transition-transform duration-700 group-hover:scale-105 rounded-tl-[30px] rounded-br-[30px] sm:rounded-tl-[52px] sm:rounded-br-[52px] rounded-tr-md rounded-bl-md"
                    sizes="(max-width: 768px) 50vw, 40vw"
                  />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dot Indicators (Center Bottom) */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 cursor-pointer ${
              index === realIndex
                ? "bg-[#FF6900] border-[#FF6900] scale-110"
                : "bg-transparent border-slate-300 hover:bg-slate-300"
            }`}
          />
        ))}
      </div>

      {/* Control Buttons (Bottom Right) */}
      <div className="absolute bottom-4 right-10 sm:bottom-6 sm:right-20 flex items-center gap-3 z-30">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          aria-label="Previous slide"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm hover:bg-[#FF6900] hover:text-white hover:border-[#FF6900] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          aria-label="Next slide"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm hover:bg-[#FF6900] hover:text-white hover:border-[#FF6900] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Play / Pause Autoplay Button */}
        <button
          onClick={handleTogglePlay}
          aria-label={isPlaying ? "Pause autoplay" : "Start autoplay"}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm hover:bg-[#FF6900] hover:text-white hover:border-[#FF6900] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          {isPlaying ? (
            <Pause className="w-4.5 h-4.5 fill-current" />
          ) : (
            <Play className="w-4.5 h-4.5 fill-current translate-x-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}
