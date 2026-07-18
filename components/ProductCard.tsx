"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { Product } from "@/lib/products";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    discount?: number;
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
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const isSaved = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product as Product);
  };

  const mainImage = product.images?.[0] && typeof product.images[0] === 'string' && product.images[0].trim().length > 0
    ? product.images[0]
    : "https://placehold.co/800?text=photo+unavailable&font=roboto";

  const discountPercent = product.discount != null && product.discount > 0
    ? Math.round(product.discount)
    : (product.oldPrice && product.oldPrice > product.price
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : 0);

  return (
    <article className="flex flex-col w-full overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-blue-500/10 group">
      <Link href={`/products/${product.slug}`} className="relative block h-32 md:h-48 overflow-hidden">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <div className="absolute left-2 top-2 z-10 flex flex-col gap-1 items-start">
          {discountPercent > 0 && (
            <span className="rounded bg-red-600 px-2 py-0.5 text-[8px] md:text-xs font-bold text-white shadow-xs">
              -{discountPercent}% OFF
            </span>
          )}
          {!product.inStock && (
            <span className="rounded bg-slate-900/90 px-2 py-0.5 text-[10px] md:text-xs font-semibold text-white shadow-xs backdrop-blur-xs">
              Out of stock
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product as Product);
          }}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute bottom-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition hover:scale-110 active:scale-95 group/heart z-10 cursor-pointer"
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
            <p className="text-xs font-black uppercase tracking-widest text-orange-500">
              {product.brand}
            </p>
            <Link
              href={`/products/${product.slug}`}
              className="line-clamp-2 text-sm font-medium text-slate-900 hover:text-orange-500 transition-colors"
            >
              {product.name}
            </Link>
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
            className="w-full sm:w-auto rounded-full bg-white px-2 py-2 md:px-4 md:py-2 text-[10px] md:text-xs font-bold text-gray-900 hover:text-white border border-gray-900 shadow-md transition-all hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 text-center whitespace-nowrap"
          >
            {product.inStock ? "Add to cart" : "Notify me"}
          </button>
        </div>
      </div>
    </article>
  );
}




