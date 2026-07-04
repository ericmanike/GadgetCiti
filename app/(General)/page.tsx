'use client';
import { ProductCard } from '@/components/ProductCard';
import Link from "next/link";
import FramerMultiSlideCarousel from '@/components/multicouresel';

import HeroSlider from '@/components/HeroSlider';
import Image from 'next/image';

import { fetchAllProducts, Product } from '@/lib/products';
import { useEffect, useState } from 'react';

const COMPUTER_SLIDES = [
  { id: 1, url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80', title: 'High-End Workstations', description: 'Powerful setups for creators and developers.' },
  { id: 2, url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1200&q=80', title: 'Gaming Beasts', description: 'Experience pure performance with top-tier hardware.' },
  { id: 3, url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80', title: 'IT Lab Gear', description: 'Reliable networking and server infrastructure.' },
];



export default function Home() {
  const [ALL_PRODUCTS, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchAllProducts().then(setAllProducts);
  }, []);

  // Basic slice partitioning for demo since ID is now dynamic from DB
  const SPONSORED_GADGETS = ALL_PRODUCTS.slice(0, 6);
  const LATEST_GADGETS = ALL_PRODUCTS.length > 6 ? ALL_PRODUCTS.slice(6, 10) : ALL_PRODUCTS.slice(0, 4);
  const RECOMMENDED_GADGETS = ALL_PRODUCTS.length > 10 ? ALL_PRODUCTS.slice(10, 16) : ALL_PRODUCTS.slice(0, 6);

  return (
    <main className="w-full bg-slate-50 min-h-screen pt-24 pb-20 overflow-x-hidden">
      <div className="relative z-10 px-4 md:px-10 space-y-24">

        {/* Shop by Category - Carousel */}
        <section className="w-full bg-white py-6 md:p-10 rounded-[15px] md:rounded-[15px] shadow-lg shadow-slate-100/50 border border-slate-50">

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {/* Featured: Computers & IT Gadgets - Interactive Carousel */}
            <div className="col-span-full h-[fit-content] relative group  rounded-[9px] shadow-lg mt-15 md:mt-1">
              <HeroSlider
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
              />
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
              { title: 'Laptops', url: '/L1.jpg', query: 'laptops' },
              { title: 'Printers', url: '/printers', query: 'printers' },
              { title: 'Flashy iPhones', url: '/p2.jpg', query: 'iphones' },
              { title: 'hardware & IT infrastructure', url: '/hardware.jpg', query: 'hardware & IT infrastructure' },
              { title: 'Tablets', url: '/tb1.jpg', query: 'tablets' },
              { title: 'Accessories', url: '/access.jpg', query: 'accessories' },
            ].map((cat, idx) => (
              <Link
                key={idx}
                href={`/buy?category=${cat.query}`}
                className="relative h-[90px] md:h-[150px] rounded-[8px] overflow-hidden group shadow-sm border border-slate-100  bg-slate-100 md:col-span-2"
              >
                <Image
                  src={cat.url}
                  alt={cat.title}
                  fill
                  priority={true}
                  placeholder='blur'
                  blurDataURL="data:image/jpeg;base64"
                  className="absolute inset-0 w-full h-full  object-cover transition-transform duration-500 group-hover:scale-110"

                />
                <div className="absolute inset-0 bg-transparent group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <span className="text-white font-bold text-sm md:text-base tracking-wide drop-shadow-md text-center">
                    {cat.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </section>

        {/* Sponsored Gadgets - Carousel */}
        <section className="w-full">
          <FramerMultiSlideCarousel
            items={SPONSORED_GADGETS}
            renderItem={(product) => <ProductCard product={product} />}
            title="Gadgets For You"
            viewAllLink="/buy"
          /> 
        </section>

        {/* Trending Now - Carousel */}
        <section className="w-full overflow-hidden pb-10">
          <FramerMultiSlideCarousel
            items={RECOMMENDED_GADGETS}
            renderItem={(product) => <ProductCard product={product} />}
            title="Most Popular"
            viewAllLink="/buy"
          />
        </section>

      </div>
    </main>
  );
}
