'use client'
import { FirstVisitPopup } from '@/components/FirstVisitAlert';
import { ProductCard } from '@/components/ProductCard';
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import FramerMultiSlideCarousel from '@/components/multicouresel';
import FeaturedCarousel from '@/components/FeaturedCarousel';

import { ALL_PRODUCTS } from '@/lib/products';

const SPONSORED_GADGETS = ALL_PRODUCTS.filter(p => ["s1", "s2", "s3", "s4", "s5", "s6"].includes(p.id));
const LATEST_GADGETS = ALL_PRODUCTS.filter(p => ["l1", "l2", "l3", "l4"].includes(p.id));
const RECOMMENDED_GADGETS = ALL_PRODUCTS.filter(p => ["r1", "r2", "r3", "r4", "r5", "r6"].includes(p.id));

const COMPUTER_SLIDES = [
  { id: 1, url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80', title: 'High-End Workstations', description: 'Powerful setups for creators and developers.' },
  { id: 2, url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1200&q=80', title: 'Gaming Beasts', description: 'Experience pure performance with top-tier hardware.' },
  { id: 3, url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80', title: 'IT Lab Gear', description: 'Reliable networking and server infrastructure.' },
];

const ACCESSORY_SLIDES = [
  { id: 1, url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', title: 'Premium Audio', description: 'Crystal clear sound for your daily grind.' },
  { id: 2, url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80', title: 'Ergonomic Gear', description: 'Comfort meets style in your workspace.' },
  { id: 3, url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80', title: 'Smart Wearables', description: 'Stay connected on the move.' },
];

export default function Home() {
  return (
    <main className="w-full bg-slate-50 min-h-screen pt-32 pb-20 overflow-x-hidden">
      <div className="relative z-10 px-4 md:px-10 space-y-24">

        {/* Shop by Category - Carousel */}
        <section className="w-full bg-white p-6 md:p-12 rounded-3xl md:rounded-[3.5rem] shadow-lg shadow-slate-100/50 border border-slate-50">

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 h-[400px] md:h-[600px]">
            {/* Featured: Computers & IT Gadgets - Interactive Carousel */}
            <div className="col-span-2 lg:col-span-3 row-span-1 lg:row-span-2 relative group overflow-hidden rounded-3xl">
              <FeaturedCarousel items={COMPUTER_SLIDES} linkHref="/buy?category=laptops" />
            </div>

            {/* Smartphones */}
            <Link
              href="/buy?category=phones"
              className="col-span-1 lg:col-span-2 relative group overflow-hidden rounded-3xl"
            >
              <img
                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80"
                alt="Smartphones"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors p-4 md:p-8 flex flex-col justify-end">
                <h3 className="text-white text-lg md:text-3xl font-black uppercase mb-1">Smartphones</h3>
                <p className="text-white/80 text-[10px] md:text-sm font-medium">Newest mobile flagship tech</p>
              </div>
            </Link>

            {/* Accessories - Interactive Carousel (Manual Only) */}
            <div className="col-span-1 relative group overflow-hidden rounded-3xl">
              <FeaturedCarousel
                items={ACCESSORY_SLIDES}
                linkHref="/buy?category=accessories"
                autoSlide={false}
                showArrowBg={false}
              />
            </div>
          </div>

        </section>

        {/* Sponsored Gadgets - Carousel */}
        <section className="w-full">
          <FramerMultiSlideCarousel
            items={SPONSORED_GADGETS}
            renderItem={(product) => <ProductCard product={product} />}
            viewAllLink="/buy"
          />
        </section>

        {/* Trending Now - Carousel */}
        <section className="w-full overflow-hidden pb-10">
          <FramerMultiSlideCarousel
            items={RECOMMENDED_GADGETS}
            renderItem={(product) => <ProductCard product={product} />}
            viewAllLink="/buy"
          />
        </section>

      </div>

      <FirstVisitPopup />
    </main>
  );
}
