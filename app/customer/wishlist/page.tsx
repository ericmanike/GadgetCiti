'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '@/components/WishlistContext';
import { useCart } from '@/components/CartContext';
import { formatCurrency } from '@/lib/utils';

export default function WishlistPage() {
    const { wishlist, removeFromWishlist, clearWishlist, totalWishlistItems } = useWishlist();
    const { addToCart } = useCart();

    return (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-100 min-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center font-bold">
                        <Heart className="size-5 fill-red-500 text-red-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Saved Items</h1>
                            <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                {totalWishlistItems} {totalWishlistItems === 1 ? 'item' : 'items'}
                            </span>
                        </div>
                        <p className="text-xs md:text-sm text-slate-500">Items you've bookmarked to buy later</p>
                    </div>
                </div>

                {totalWishlistItems > 0 && (
                    <button
                        onClick={clearWishlist}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                        <Trash2 size={14} />
                        Clear All
                    </button>
                )}
            </div>

            {/* Content Body */}
            <div className="p-4 md:p-6 flex-1 flex flex-col">
                {totalWishlistItems === 0 ? (
                    /* Empty State */
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 md:py-20 max-w-md mx-auto">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
                                <Heart size={44} className="text-red-400 stroke-[1.5]" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-amber-100 p-2 rounded-full border-2 border-white text-amber-600">
                                <Sparkles size={18} />
                            </div>
                        </div>

                        <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">
                            Your Saved Items list is empty
                        </h2>
                        <p className="text-xs md:text-sm text-slate-500 mb-8 leading-relaxed">
                            Found something you like? Click the heart icon on any product card while browsing to save it here for quick access later.
                        </p>

                        <Link href="/buy">
                            <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-xs md:text-sm font-bold tracking-wide transition-all shadow-md hover:shadow-orange-500/20 active:scale-95 cursor-pointer">
                                <ShoppingBag size={18} />
                                Start Shopping
                                <ArrowRight size={16} />
                            </button>
                        </Link>
                    </div>
                ) : (
                    /* Saved Products Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        <AnimatePresence>
                            {wishlist.map((product) => {
                                const discountPercent = product.oldPrice && product.oldPrice > product.price
                                    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                                    : null;

                                return (
                                    <motion.article
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex flex-col rounded-xl bg-white border border-slate-100 shadow-xs hover:shadow-md transition-all group overflow-hidden relative"
                                    >
                                        {/* Product Image & Badges */}
                                        <div className="relative h-44 md:h-48 bg-slate-50 overflow-hidden">
                                            <Link href={`/products/${product.slug}`} className="block w-full h-full">
                                                <Image
                                                    src={product.images?.[0] || "/next.svg"}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                />
                                            </Link>

                                            {/* Out of Stock / Discount Badge */}
                                            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                                                {!product.inStock && (
                                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                                                        Out of stock
                                                    </span>
                                                )}
                                                {discountPercent && (
                                                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                                                        -{discountPercent}% OFF
                                                    </span>
                                                )}
                                            </div>

                                            {/* Remove from wishlist button */}
                                            <button
                                                onClick={() => removeFromWishlist(product.id)}
                                                title="Remove from saved items"
                                                className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 text-slate-400 hover:text-red-500 hover:bg-white shadow-xs backdrop-blur-xs transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {/* Content info */}
                                        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">
                                                    {product.brand}
                                                </p>
                                                <Link href={`/products/${product.slug}`}>
                                                    <h3 className="font-bold text-sm text-slate-900 hover:text-orange-500 transition-colors line-clamp-2">
                                                        {product.name}
                                                    </h3>
                                                </Link>
                                            </div>

                                            <div>
                                                <div className="flex items-baseline gap-2 mb-3">
                                                    <span className="text-base font-black text-slate-900">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                    {product.oldPrice && (
                                                        <span className="text-xs text-slate-400 line-through">
                                                            {formatCurrency(product.oldPrice)}
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => addToCart(product)}
                                                    disabled={!product.inStock}
                                                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-orange-500 disabled:bg-slate-200 disabled:text-slate-400 text-white py-2.5 px-3 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                                                >
                                                    <ShoppingBag size={14} />
                                                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.article>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
