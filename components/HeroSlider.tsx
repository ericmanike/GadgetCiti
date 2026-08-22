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
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = slides.length;

  useEffect(() => {
    if (isPlaying && totalSlides > 0) {
      timerRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % totalSlides);
      }, autoplayInterval);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, totalSlides, autoplayInterval, current]);

  if (!slides || slides.length === 0) {
    return null;
  }

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleDotClick = (index: number) => {
    setCurrent(index);
  };

  return (
    <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[460px] overflow-hidden bg-white border-b border-slate-100 select-none">
      {/* Decorative Light Glow Elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#632CF5]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

      {/* Slides container */}
      <div
        className="flex w-full h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => {
          return (
            <div
              key={slide.id}
              className="relative w-full h-full flex-none shrink-0"
            >
              {/* Slide Content Layout: Left Text, Right Image */}
              <div className="relative h-full max-w-6xl mx-auto px-6 sm:px-12 flex items-center justify-between z-20 gap-6 lg:gap-12">
                {/* Left Text Column */}
                <div className="flex-1 max-w-xl text-left py-6">
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-[1.15]">
                    {slide.title}
                  </h1>
                  <p className="mt-4 sm:mt-5 text-sm sm:text-base text-slate-600 line-clamp-3">
                    {slide.description}
                  </p>
                  <div className="mt-8 sm:mt-10 lg:mt-12">
                    <Link
                      href={slide.ctaLink}
                      className="inline-block bg-[#FF6900] text-white font-bold px-6 py-3 sm:px-8 sm:py-3.5 rounded-1xl hover:bg-orange-600 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-orange-500/25 text-sm sm:text-base"
                    >
                      {slide.ctaText}
                    </Link>
                  </div>
                </div>

                {/* Right Image Column (Framed Image) */}
                <div className="relative w-[160px] h-[160px] sm:w-[280px] sm:h-[240px] lg:w-[420px] lg:h-[300px] shrink-0   overflow-hidden border border-slate-200 bg-slate-100 shadow-xl shadow-slate-200/70 group">
                  <Image
                    src={slide.backgroundImage}
                    alt={slide.imageAlt || slide.title}
                    fill
                    priority={index === 0}
                    className="object-cover object-center w-full h-full transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 40vw"
                  />
                </div>
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
            className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 cursor-pointer ${index === current
                ? "bg-[#FF6900] border-[#FF6900] scale-110"
                : "bg-transparent border-slate-300 hover:bg-slate-300"
              }`}
          />
        ))}
      </div>

      {/* Control Buttons (Bottom Right) */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-12 flex items-center gap-3 z-30">
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
