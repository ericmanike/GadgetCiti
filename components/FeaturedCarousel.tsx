'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'motion/react';
import Link from 'next/link';

interface Item {
    id: number;
    url: string;
    title: string;
    description: string;
}

interface FeaturedCarouselProps {
    items: Item[];
    linkHref: string;
    autoSlide?: boolean;
    showArrowBg?: boolean;
}

export default function FeaturedCarousel({ items, linkHref, autoSlide = true, showArrowBg = true }: FeaturedCarouselProps) {
    const [index, setIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);

    useEffect(() => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth || 1;
            const targetX = -index * containerWidth;

            animate(x, targetX, {
                type: 'spring',
                stiffness: 300,
                damping: 30,
            });
        }
    }, [index, x]);

    // Handle auto-slide
    useEffect(() => {
        if (!autoSlide || !items || items.length === 0) return;
        const timer = setInterval(() => {
            setIndex((i) => (i === items.length - 1 ? 0 : i + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [items, autoSlide]);

    if (!items || items.length === 0) return null;

    return (
        <div className='relative w-full h-full overflow-hidden' ref={containerRef}>
            <motion.div
                className='flex h-full cursor-grab active:cursor-grabbing'
                style={{ x }}
                drag="x"
                dragConstraints={containerRef}
                onDragEnd={(_, info) => {
                    const containerWidth = containerRef.current?.offsetWidth || 1;
                    const dragOffset = info.offset.x;
                    const dragVelocity = info.velocity.x;

                    let newIndex = index;

                    if (Math.abs(dragVelocity) > 500) {
                        if (dragVelocity > 0) {
                            newIndex = Math.max(0, index - 1);
                        } else {
                            newIndex = Math.min(items.length - 1, index + 1);
                        }
                    } else {
                        const movedSlides = -dragOffset / containerWidth;
                        newIndex = Math.max(0, Math.min(items.length - 1, Math.round(index + movedSlides)));
                    }

                    setIndex(newIndex);
                }}
            >
                {items.map((item) => (
                    <div key={item.id} className='shrink-0 w-full h-full relative'>
                        <img
                            src={item.url}
                            alt={item.title}
                            className='w-full h-full object-cover select-none pointer-events-none'
                            draggable={false}
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 md:p-8 flex flex-col justify-end">
                            <h3 className="text-white text-xl md:text-3xl font-black mb-1 md:mb-1 uppercase tracking-tighter">
                                {item.title}
                            </h3>
                            <p className="text-blue-400 font-bold text-[10px] md:text-base mb-3 max-w-sm">
                                {item.description}
                            </p>
                            <Link
                                href={linkHref}
                                className="w-fit bg-white text-black px-4 py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase hover:bg-blue-500 hover:text-white transition-colors"
                            >
                                Shop Collection
                            </Link>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Navigation Buttons */}
            <motion.button
                disabled={index === 0}
                onClick={(e) => {
                    e.preventDefault();
                    setIndex((i) => Math.max(0, i - 1));
                }}
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all z-10
          ${index === 0
                        ? 'opacity-0 pointer-events-none'
                        : showArrowBg
                            ? 'bg-white text-black hover:scale-110 opacity-90 shadow-lg'
                            : 'bg-transparent text-white hover:scale-125 opacity-100 drop-shadow-lg'
                    }`}
            >
                <svg className='w-4 h-4 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={4} d='M15 19l-7-7 7-7' />
                </svg>
            </motion.button>

            <motion.button
                disabled={index === items.length - 1}
                onClick={(e) => {
                    e.preventDefault();
                    setIndex((i) => Math.min(items.length - 1, i + 1));
                }}
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all z-10
          ${index === items.length - 1
                        ? 'opacity-0 pointer-events-none'
                        : showArrowBg
                            ? 'bg-white text-black hover:scale-110 opacity-90 shadow-lg'
                            : 'bg-transparent text-white hover:scale-125 opacity-100 drop-shadow-lg'
                    }`}
            >
                <svg className='w-4 h-4 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={4} d='M9 5l7 7-7 7' />
                </svg>
            </motion.button>

            {/* Progress Dots */}
            <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5'>
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-blue-500' : 'w-2 bg-white/40'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
