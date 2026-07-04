'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'motion/react';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface FramerMultiSlideCarouselProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    title?: string;
    viewAllLink?: string;
    breakpoints?: {
        [key: number]: { slidesToShow: number };
    };
    gap?: number;
}

export default function FramerMultiSlideCarousel<T>({
    items = [],
    renderItem,
    title,
    viewAllLink,
    breakpoints = {
        0: { slidesToShow: 2 },
        640: { slidesToShow: 2 },
        1024: { slidesToShow: 3 },
        1280: { slidesToShow: 4 },
    },
    gap = 24,
}: FramerMultiSlideCarouselProps<T>) {
    const [index, setIndex] = useState(0);
    const [slidesToShow, setSlidesToShow] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);

    // Handle responsive breakpoints
    useEffect(() => {
        const updateSlidesToShow = () => {
            const width = window.innerWidth;
            const sortedBreakpoints = Object.keys(breakpoints)
                .map(Number)
                .sort((a, b) => b - a);

            for (const bp of sortedBreakpoints) {
                if (width >= bp) {
                    // @ts-ignore
                    setSlidesToShow(breakpoints[bp].slidesToShow);
                    break;
                }
            }
        };

        updateSlidesToShow();
        window.addEventListener('resize', updateSlidesToShow);
        return () => window.removeEventListener('resize', updateSlidesToShow);
    }, [breakpoints]);

    useEffect(() => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth || 1;
            // The step size is (containerWidth + gap) / slidesToShow
            // because there are (slidesToShow - 1) gaps in one container width.
            const slideWidth = (containerWidth + gap) / slidesToShow;
            const targetX = -index * slideWidth;

            animate(x, targetX, {
                type: 'spring',
                stiffness: 300,
                damping: 35,
                mass: 0.8
            });
        }
    }, [index, slidesToShow, items.length, gap]);

    // Reset index if it exceeds max when resizing
    useEffect(() => {
        const maxIndex = Math.max(0, items.length - slidesToShow);
        if (index > maxIndex) {
            setIndex(maxIndex);
        }
    }, [slidesToShow, index, items.length]);

    const maxIndex = Math.max(0, items.length - slidesToShow);

    return (
        <div className='w-full'>
            {(title || viewAllLink) && (
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    {title && (
                        <h2 className="text-[10px] md:text-2xl font-black text-slate-900 flex items-center gap-2 md:gap-3 uppercase">
                            {title}
                        </h2>
                    )}
                    {viewAllLink && items.length > 0 && (
                        <Link href={viewAllLink} className="text-orange-500 font-bold text-[12px] md:text-base flex items-center hover:translate-x-1 transition-transform group whitespace-nowrap">
                            View All <ChevronRight size={14} className="md:size-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}
                </div>
            )}

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                    <p className="text-slate-500 font-semibold text-sm md:text-base text-center uppercase tracking-wide">
                        No products available at this time
                    </p>
                </div>
            ) : (
                <div className='flex flex-col gap-3'>
                    <div className='relative overflow-hidden rounded-xl p-2' ref={containerRef}>
                        <motion.div
                            className='flex cursor-grab active:cursor-grabbing'
                            style={{ x, gap: `${gap}px` }}
                            drag="x"
                            dragConstraints={{ left: -maxIndex * ((containerRef.current?.offsetWidth || 0) + gap) / slidesToShow, right: 0 }}
                            dragElastic={0.1}
                            dragMomentum={false}
                            onDragEnd={(_, info) => {
                                const containerWidth = containerRef.current?.offsetWidth || 1;
                                const slideWidth = (containerWidth + gap) / slidesToShow;
                                const dragOffset = info.offset.x;
                                const dragVelocity = info.velocity.x;

                                let newIndex = index;
                                if (Math.abs(dragVelocity) > 500) {
                                    newIndex = dragVelocity > 0 ? index - 1 : index + 1;
                                } else {
                                    const movedSlides = -dragOffset / slideWidth;
                                    newIndex = index + Math.round(movedSlides);
                                }

                                newIndex = Math.max(0, Math.min(newIndex, maxIndex));

                                if (newIndex !== index) {
                                    setIndex(newIndex);
                                } else {
                                    // Explicitly snap back if index didn't change
                                    const targetX = -index * slideWidth;
                                    animate(x, targetX, {
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 35,
                                        mass: 0.8
                                    });
                                }
                            }}
                        >
                            {items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className='shrink-0 h-full rounded-lg'
                                    style={{
                                        width: `calc((100% - ${(slidesToShow - 1) * gap
                                            }px) / ${slidesToShow})`,
                                    }}
                                >
                                    {renderItem(item)}
                                </div>
                            ))}
                        </motion.div>

                        {/* Navigation Buttons */}
                        {maxIndex > 0 && (
                            <>
                                <motion.button
                                    disabled={index === 0}
                                    onClick={() => setIndex((i) => Math.max(0, i - 1))}
                                    className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg transition-all z-10
                      ${index === 0
                                            ? 'opacity-0 pointer-events-none'
                                            : 'bg-white text-black hover:scale-110 opacity-90'
                                        }`}
                                >
                                    <svg
                                        className='w-4 h-4 md:w-6 md:h-6'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={4}
                                            d='M15 19l-7-7 7-7'
                                        />
                                    </svg>
                                </motion.button>

                                <motion.button
                                    disabled={index === maxIndex}
                                    onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
                                    className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg transition-all z-10
                      ${index === maxIndex
                                            ? 'opacity-0 pointer-events-none'
                                            : 'bg-white text-black hover:scale-110 opacity-90'
                                        }`}
                                >
                                    <svg
                                        className='w-4 h-4 md:w-6 md:h-6'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={4}
                                            d='M9 5l7 7-7 7'
                                        />
                                    </svg>
                                </motion.button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
