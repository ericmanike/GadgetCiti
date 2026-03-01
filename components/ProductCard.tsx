"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    oldPrice?: number;
    brand: string;
    category: string;
    images: string[];
    inStock: boolean;
    rating: number;
    ratingCount: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isSaved, setIsSaved] = useState(false);


  const handleAddToCart = () => {

  };

  return (
    <article className="flex flex-col w-full overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-blue-500/10 group">
      <Link href={`/products/${product.slug}`} className="relative block h-32 md:h-48 overflow-hidden">
        <Image
          src={product.images[0] ?? "/next.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {!product.inStock && (
          <span className="absolute left-2 top-2 rounded bg-red-500 px-2 py-0.5 text-xs font-semibold text-white z-10">
            Out of stock
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsSaved(!isSaved);
          }}
          className="absolute bottom-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition hover:scale-110 active:scale-95 group/heart z-10"
        >
          <Heart
            size={18}
            className={`transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-slate-600 group-hover/heart:text-red-500'}`}
          />
        </button>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600">
              {product.brand}
            </p>
            <Link
              href={`/products/${product.slug}`}
              className="line-clamp-2 text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors"
            >
              {product.name}
            </Link>
          </div>
          <div className="text-right text-xs text-red-500">
            ★ {product.rating.toFixed(1)}
            <span className="ml-1 text-[10px] text-gray-500">
              ({product.ratingCount})
            </span>
          </div>
        </div>
        <p className="line-clamp-2 text-xs text-gray-600">
          {product.description}
        </p>
        <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2">
          <div>
            <p className="text-base md:text-lg font-bold text-gray-900">
              {formatCurrency(product.price)}
            </p>
            {product.oldPrice && (
              <p className="text-[10px] md:text-xs text-gray-500 line-through">
                {formatCurrency(product.oldPrice)}
              </p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full sm:w-auto rounded-full bg-white px-2 py-2 md:px-4 md:py-2 text-[10px] md:text-xs font-bold text-gray-900 hover:text-white border border-gray-900 shadow-md transition-all hover:bg-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 text-center whitespace-nowrap"
          >
            {product.inStock ? "Add to cart" : "Notify me"}
          </button>
        </div>
      </div>
    </article>
  );
}




