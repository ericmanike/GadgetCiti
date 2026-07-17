'use client';
import { ProductCard } from '@/components/ProductCard';
import Link from "next/link";
import FramerMultiSlideCarousel from '@/components/multicouresel';

import HeroSlider from '@/components/HeroSlider';
import Image from 'next/image';

import { fetchAllProducts, Product } from '@/lib/products';
import { useEffect, useState } from 'react';
import Pattern from '@/components/ui/Pattern';
import { ChevronDown } from 'lucide-react';
import SkeletonCards from '@/components/SkeletonCards';

const COMPUTER_SLIDES = [
  { id: 1, url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80', title: 'High-End Workstations', description: 'Powerful setups for creators and developers.' },
  { id: 2, url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1200&q=80', title: 'Gaming Beasts', description: 'Experience pure performance with top-tier hardware.' },
  { id: 3, url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80', title: 'IT Lab Gear', description: 'Reliable networking and server infrastructure.' },
];



export default function Home() {
  const [ALL_PRODUCTS, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAllProducts().then((products) => {
      setAllProducts(products);
      setLoading(false);
    });
  }, []);

  // Basic slice partitioning for demo since ID is now dynamic from DB
  const SPONSORED_GADGETS = ALL_PRODUCTS.slice(0, 6);
  const LATEST_GADGETS = ALL_PRODUCTS.length > 6 ? ALL_PRODUCTS.slice(6, 10) : ALL_PRODUCTS.slice(0, 4);
  const RECOMMENDED_GADGETS = ALL_PRODUCTS.length > 10 ? ALL_PRODUCTS.slice(10, 16) : ALL_PRODUCTS.slice(0, 6);

  return (
    <main className="w-full bg-slate-50 min-h-screen pt-24 pb-20 overflow-x-hidden">
      
      <div className="relative  z-10 px-4 md:px-10 space-y-24">
          <Pattern/>
        {/* Shop by Category - Carousel */}
        <section className="w-full  py-6 md:p-10 rounded-[15px] md:rounded-[15px] bg-transparent shadow-lg shadow-slate-100/50 border border-slate-50">
       
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {/* Featured: Computers & IT Gadgets - Interactive Carousel */}
            <div className="col-span-full h-[fit-content] relative group  rounded-[9px] shadow-lg mt-15 md:mt-1">
              {/* <HeroSlider
                slides={
                  COMPUTER_SLIDES.map((slide) => ({
                    id: slide.id,
                    title: slide.title,
                    backgroundImage: slide.url,
                    description: slide.description,
                    ctaLink: "/buy",
                    ctaText: "Shop Now",


                  }))}
                autoplay={true}
                autoplayInterval={3000}
              /> */}
            </div>

            {/* Section Header Text */}
            <div className="col-span-full mt-6 mb-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight uppercase">
                Shop by Category
              </h2>
              <p className="text-sm text-slate-500">
                Explore our curated selection of high-quality electronics and tech accessories.
              </p>
            </div>

            {/* Small Category Cards */}
            {[
              { title: 'Computers', url: '/L1.jpg', query: 'computers' },
         
              { title: 'Latest Smartphones', url: '/cat_smartphones.png', query: 'smartphones' },
              { title: 'Tablets & Ipad', url: '/cat_tablets.png', query: 'tablets-ipads' },
              { title: 'Accessories ', url: '/cat_accessories.png', query: 'accessories' },
             { title: 'Printers & Scanners', url: '/cat_printers.png', query: 'printers-scanners' },
              { title: 'Network Devices', url: '/starlink.png', query: 'wifi-network-devices' },
            ].map((cat, idx) => (
              <Link
                key={idx}
                href={`/buy?category=${cat.query}`}
                className="group flex flex-col gap-2 md:col-span-2 select-none"
              >
                {/* Image Container */}
                <div className="relative h-[110px] md:h-[160px] rounded-xl overflow-hidden shadow-sm border border-slate-100 bg-slate-100 w-full">
                  <Image
                    src={cat.url}
                    alt={cat.title}
                    fill
                    priority={true}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                {/* Label under card */}
                <span className="text-xs md:text-sm font-bold text-slate-800 tracking-wide text-center group-hover:text-orange-500 transition-colors">
                  {cat.title.toUpperCase()}
                </span>
              </Link>
            ))}

            {/* View All Button */}
            <div className="col-span-full flex justify-center mt-6">
              <Link
                href="/categories"
                className="
                flex  items-center justify-between gap-3 
                px-8 py-3 bg-orange-500 
                hover:bg-orange-600 text-white rounded-xl
                font-bold text-sm md:text-1xl tracking-wide 
                transition-all duration-200 shadow-md
                hover:shadow-lg
                hover:scale-102 active:scale-98
                cursor-pointer select-none"
              >
                Explore All
                <ChevronDown className="w-3.5 h-3.5 ml-1" /> 
              </Link>
            </div>
          </div>

        </section>

        {/* Sponsored Gadgets - Carousel */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-[10px] md:text-2xl font-black text-slate-900 flex items-center gap-2 md:gap-3 uppercase">
              For You
            </h2>
            {!loading && SPONSORED_GADGETS.length > 0 && (
              <Link href="/buy" className="text-orange-500 font-bold text-[12px] md:text-base flex items-center hover:translate-x-1 transition-transform group whitespace-nowrap">
                View All <svg className="w-4 h-4 md:w-5 md:h-5 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            )}
          </div>
          {loading ? (
            <SkeletonCards cols={4} rows={1} />
          ) : (
            <FramerMultiSlideCarousel
              items={SPONSORED_GADGETS}
              renderItem={(product) => <ProductCard product={product} />}
            />
          )}
        </section>

        {/* Trending Now - Carousel */}
        <section className="w-full overflow-hidden pb-10">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-[10px] md:text-2xl font-black text-slate-900 flex items-center gap-2 md:gap-3 uppercase">
              Most Popular
            </h2>
            {!loading && RECOMMENDED_GADGETS.length > 0 && (
              <Link href="/buy" className="text-orange-500 font-bold text-[12px] md:text-base flex items-center hover:translate-x-1 transition-transform group whitespace-nowrap">
                View All <svg className="w-4 h-4 md:w-5 md:h-5 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            )}
          </div>
          {loading ? (
            <SkeletonCards cols={4} rows={1} />
          ) : (
            <FramerMultiSlideCarousel
              items={RECOMMENDED_GADGETS}
              renderItem={(product) => <ProductCard product={product} />}
            />
          )}
        </section>

      </div>
    </main>
  );
}
