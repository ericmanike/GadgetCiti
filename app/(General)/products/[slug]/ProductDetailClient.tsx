"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Star,

    ShoppingCart,
    ShieldCheck,
    Truck,
    RotateCcw,
    Store,
    Heart,
    Share2,
    ChevronRight,
    Minus,
    Plus,
    CheckCircle2,
    MessageSquare

} from "lucide-react";
import { Product } from "@/lib/products";
import { formatCurrency } from "@/lib/utils";
import { ProductCard } from "@/components/ProductCard";

interface ProductDetailClientProps {
    product: Product;
    relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isSaved, setIsSaved] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    const images = product.images.length > 0 ? product.images : ["/next.svg"];

    return (
        <div className="flex flex-col gap-10 ">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500 font-medium">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <ChevronRight size={12} />
                <Link href="/buy" className="hover:text-blue-600">Buy Gadgets</Link>
                <ChevronRight size={12} />
                <span className="text-gray-900 truncate">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Left: Image Gallery */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <motion.div
                        layoutId={`image-${product.slug}`}
                        className="aspect-square relative rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 group"
                    >
                        <Image
                            src={images[activeImage]}
                            alt={product.name}
                            fill
                            className="object-cover rounded-2xl  transition-transform duration-500 group-hover:scale-105"
                            priority
                        />
                        {!product.inStock && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                                <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold uppercase tracking-widest text-xs">
                                    Out of Stock
                                </span>
                            </div>
                        )}
                    </motion.div>

                    <div className="flex gap-3 h-fit overflow-x-auto p-2 no-scrollbar">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(idx)}
                                className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all shrink-0 ${activeImage === idx ? "border-slate-900  ring-slate-700 shadow-md scale-105" : "border-transparent bg-white hover:border-gray-200"
                                    }`}
                            >
                                <Image src={img} alt={`${product.name} thumbnail ${idx}`} fill className="object-cover p-1 rounded-full" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Middle: Product Info */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Link href={`/buy?brand=${product.brand}`} className="text-slate-700 text-sm font-black uppercase tracking-widest hover:underline">
                                {product.brand}
                            </Link>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsSaved(!isSaved)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <Heart size={20} className={isSaved ? "fill-red-500 text-red-500" : "text-gray-400"} />
                                </button>
                                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <Share2 size={20} className="text-gray-400" />
                                </button>
                            </div>
                        </div>
                        <h1 className="text-1xl md:text-2xl font-black text-gray-900 leading-tight">
                            {product.name}
                        </h1>
                        <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center  px-2 py-0.5 rounded-lg">
                                <Star size={16} className="fill-orange-400 text-orange-400" />
                                <span className="ml-1 text-sm font-black text-orange-600">{product.rating.toFixed(1)}</span>
                            </div>
                            <span className="text-[14px] font-bold text-gray-400 border-l border-gray-200 pl-2 uppercase tracking-widest">
                                {product.ratingCount} Reviews
                            </span>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white shadow-lg transition-all duration-300 flex flex-col gap-4">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <span className="text-xl md:text-3xl font-black text-gray-900">{formatCurrency(product.price)}</span>
                                {product.oldPrice && (
                                    <span className="text-base md:text-2xl text-gray-400 line-through">{formatCurrency(product.oldPrice)}</span>
                                )}

                            </div>

                        </div>

                        <div className="flex flex-col gap-3 pt-4 border-t border-gray-50">
                            <p className="text-sm font-bold text-gray-900">Quantity</p>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-gray-200 rounded-full py-1.5 px-3 gap-6 bg-gray-50/50">
                                    <button
                                        disabled={quantity <= 1}
                                        onClick={() => setQuantity(q => q - 1)}
                                        className="p-1 hover:text-blue-600 disabled:text-gray-300 transition-colors"
                                    >
                                        <Minus size={18} strokeWidth={3} />
                                    </button>
                                    <span className="w-8 text-center font-black text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="p-1 hover:text-blue-600 transition-colors"
                                    >
                                        <Plus size={18} strokeWidth={3} />
                                    </button>
                                </div>
                                <span className="text-xs font-bold text-gray-400 italic">Only 5 items left!</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                            <button
                                className="bg-orange-600 hover:bg-orange-700 text-white font-black py-2 px-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg  disabled:bg-gray-300"
                                disabled={!product.inStock}
                            >
                                ADD TO CART
                            </button>
                            <button
                                className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-900 font-black py-2 px-4 rounded-2xl transition-all active:scale-95 disabled:border-gray-200 disabled:text-gray-300"
                                disabled={!product.inStock}
                            >
                                BUY NOW
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 rounded-2xl ">
                            <ShieldCheck className="text-blue-600" size={18} />
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-gray-900">Warranty</span>
                                <span className="text-[10px] text-gray-500 font-medium">1 Year Official Warranty</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-2xl ">
                            <RotateCcw className="text-orange-500" size={18} />
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-gray-900">3 Days Return</span>
                                <span className="text-[10px] text-gray-500 font-medium">Free return if damaged</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Shipping & Seller Sidebar */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="p-6 rounded-3xl bg-white shadow-lg flex flex-col gap-6">
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Delivery & Returns</h3>
                            <div className="flex flex-col gap-5">
                                <div className="flex gap-3">
                                    <div className="shrink-0 w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                        <Truck size={18} className="text-gray-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-xs font-bold text-gray-900 leading-tight">Delivery Express</p>
                                        <p className="text-[10px] text-gray-500 mt-1">Ready for delivery within 24 hours to Accra, Kumasi, Takoradi, Tema, and other major cities</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="shrink-0 w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                        <Store size={18} className="text-gray-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-xs font-bold text-gray-900 leading-tight">Pick-up Station</p>
                                        <p className="text-[10px] text-gray-500 mt-1">Available at  10 stations near you</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-50">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">Seller Info</h3>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-blue-600 uppercase">Letronix Official Store</span>
                                    <span className="text-[10px] text-gray-500 font-medium">98% Positive Feedback</span>
                                </div>

                            </div>

                            <div className="flex justify-around items-center gap-3 mb-4">
                                <div className="bg-gray-50 p-2 rounded-xl flex flex-col items-center">
                                    <span className="text-xs font-black text-gray-900">10k+</span>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Followers</span>
                                </div>
                                <button className="flex items-center gap-2 text-xs font-bold text-gray-900 border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-100 transition-colors">
                                    <Plus className="text-red-500" />
                                    <span>Follow</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">

                                <div className="bg-gray-50 p-2 rounded-xl flex flex-col items-center">
                                    <span className="text-xs font-black text-gray-900">4.9</span>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Store Rating</span>
                                </div>
                                <Link href="#" className="p-2 bg-blue-50 text-blue-600 rounded-lg group flex gap-2 items-center  justify-center  transition-colors">
                                    <MessageSquare />
                                    <span className="text-[10px] font-bold text-gray-900">Chat</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* <div className="p-6 rounded-3xl bg-blue-600 text-white flex flex-col gap-4 relative overflow-hidden group">
                        <div className="z-10 relative">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">PROMO DEALS</p>
                            <h4 className="text-lg font-black mt-1">Buy 2, Get 1 Free on all accessories!</h4>
                            <button className="mt-4 bg-white text-blue-600 px-4 py-2 rounded-xl font-black text-xs uppercase hover:bg-blue-50 transition-colors">Claim Now</button>
                        </div>
                        <ShoppingCart className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                    </div> */}
                </div>
            </div>

            {/* Tabs Section */}
            <div className="max-w-4xl">
                <div className="flex gap-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === "overview" ? "text-slate-900" : "text-gray-400"
                            }`}
                    >
                        Product Overview
                        {activeTab === "overview" && (
                            <motion.div layoutId="activeTabLine" className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("specs")}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === "specs" ? "text-slate-900" : "text-gray-400"
                            }`}
                    >
                        Specifications
                        {activeTab === "specs" && (
                            <motion.div layoutId="activeTabLine" className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600 rounded-t-full" />
                        )}
                    </button>
                </div>

                <div className="py-8">
                    <AnimatePresence mode="wait">
                        {activeTab === "overview" ? (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col gap-6"
                            >
                                <div className="prose prose-slate max-w-none">
                                    <p className="text-gray-600 leading-relaxed font-medium">
                                        {product.description}
                                    </p>
                                </div>
                                {product.features && (
                                    <div className="flex flex-col gap-4">
                                        <h3 className="text-base font-black text-gray-900 uppercase tracking-widest">Key Features</h3>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {product.features.map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                                    <CheckCircle2 size={18} className="text-blue-600 shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="specs"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100"
                            >
                                {product.specifications ? (
                                    product.specifications.map((spec, i) => (
                                        <div key={i} className={`flex p-4 ${i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}`}>
                                            <span className="w-1/3 text-sm font-bold text-gray-500 uppercase tracking-widest text-[10px]">{spec.label}</span>
                                            <span className="w-2/3 text-sm font-black text-gray-900">{spec.value}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-400 font-medium uppercase text-xs tracking-[0.2em]">Contact seller for full specifications</div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Related Products */}
            <section className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl md:text-3xl font-black text-gray-900 uppercase">You May Also Like</h2>
                    <Link href="/buy" className="text-orange-500 font-black text-xs uppercase hover:underline">Explore More</Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {relatedProducts.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </section>
        </div>
    );
}
