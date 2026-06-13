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

  // Clear previous timer and set a new one if playing
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
    <div className="relative w-full h-[250px] sm:h-[350px] lg:h-[450px] overflow-hidden bg-slate-900 select-none mt-5 rounded-[8px]">
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
              {/* Background Image */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={slide.backgroundImage}
                  alt={slide.imageAlt || slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover object-center w-full h-full"
                  sizes="100vw"
                />

              </div>

              {/* Slide Content */}
              <div className="relative h-full bg-linear-to-br from-black/50 to-transparent max-w-6xl mx-auto px-6 sm:px-12 flex flex-col justify-start md:justify-center items-start  z-20">
                <div className="max-w-xl text-left pt-10"> 
                  <h1 className="text-1xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight sm:leading-none md:leading-[1.1]">
                    {slide.title}
                  </h1>
                  <p className="mt-2 text-base sm:text-1xl text-slate-200">
                    {slide.description}
                  </p>
                  <div className="mt-6"> 
                    <Link
                      href={slide.ctaLink}
                      className="inline-block bg-white text-slate-950 font-bold px-8 py-3 rounded-full hover:bg-slate-100 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                      {slide.ctaText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dot Indicators (Center Bottom) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`w-2.5 h-2.5 rounded-full border border-white transition-all duration-300 cursor-pointer ${
              index === current
                ? "bg-white scale-110"
                : "bg-transparent hover:bg-white/50"
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
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-800 shadow-md hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          aria-label="Next slide"
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-800 shadow-md hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Play / Pause Autoplay Button */}
        <button
          onClick={handleTogglePlay}
          aria-label={isPlaying ? "Pause autoplay" : "Start autoplay"}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-800 shadow-md hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
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
