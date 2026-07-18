"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {

    Phone,
    ShieldCheck,
    Truck,
    RotateCcw,
    Store,
    Heart,

    ChevronRight,
    ChevronLeft,
    Minus,
    Plus,
    CheckCircle2,
    MessageSquare
} from "lucide-react";
import { Product, parseImageUrls } from "@/lib/products";
import { formatCurrency } from "@/lib/utils";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";

interface ProductDetailClientProps {
    product: Product;
    relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const { toggleWishlist, isInWishlist } = useWishlist();
    const isSaved = isInWishlist(product.id);
    const [activeTab, setActiveTab] = useState("overview");
    const [isExpanded, setIsExpanded] = useState(false);
    const { addToCart } = useCart();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [product.id]);

    const validImages = parseImageUrls(product?.images);
    const images = validImages.length > 0 ? validImages : ["https://placehold.co/800?text=photo+unavailable&font=roboto"];
    const [imgError, setImgError] = useState<Record<number, boolean>>({});

    const getImgSrc = (idx: number) => {
        if (imgError[idx]) {
            return "https://placehold.co/800?text=photo+unavailable&font=roboto";
        }
        return images[idx] || "https://placehold.co/800?text=photo+unavailable&font=roboto";
    };

    const discountPercent = product.discount != null && product.discount > 0
        ? Math.round(product.discount)
        : (product.oldPrice && product.oldPrice > product.price
            ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
            : 0);

    return (
        <div className="flex flex-col gap-6 md:gap-10 pt-18 md:pt-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500 font-medium">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <ChevronRight size={12} />
                <Link href="/buy" className="hover:text-blue-600">Shop now</Link>
                <ChevronRight size={12} />
                <span className="text-gray-900 truncate">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Left: Image Gallery */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="aspect-square relative rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 group">
                        {/* Discount Badge on Image Top Left */}
                        {discountPercent > 0 && (
                            <span className="absolute top-2.5 left-2.5 z-20 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md">
                                -{discountPercent}% OFF
                            </span>
                        )}
                        {/* Like / Heart Icon on Image Top Right */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleWishlist(product);
                            }}
                            className="absolute top-2.5 right-2.5 z-20 p-2 rounded-full bg-white/80 hover:bg-white shadow-md backdrop-blur-xs transition-all hover:scale-110 active:scale-95 cursor-pointer border border-gray-200"
                            aria-label={isSaved ? "Remove from saved items" : "Save item"}
                        >
                            <Heart size={18} className={isSaved ? "fill-red-500 text-red-500" : "text-gray-600"} />
                        </button>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeImage}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.25 }}
                                className="absolute inset-0"
                            >
                                <Image
                                    src={getImgSrc(activeImage)}
                                    alt={product.name}
                                    fill
                                    unoptimized
                                    onError={() => setImgError(prev => ({ ...prev, [activeImage]: true }))}
                                    className="object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                                    priority
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Slider Prev & Next Small Arrow Buttons */}
                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md backdrop-blur-xs transition-all hover:scale-110 active:scale-95 cursor-pointer border border-gray-200"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft size={16} strokeWidth={2.5} />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md backdrop-blur-xs transition-all hover:scale-110 active:scale-95 cursor-pointer border border-gray-200"
                                    aria-label="Next image"
                                >
                                    <ChevronRight size={16} strokeWidth={2.5} />
                                </button>
                                
                                {/* Slide Counter Badge */}
                                <div className="absolute bottom-2.5 right-2.5 z-20 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                    {activeImage + 1} / {images.length}
                                </div>
                            </>
                        )}

                        {!product.inStock && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm z-30">
                                <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold uppercase tracking-widest text-xs shadow-md">
                                    Out of Stock
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 h-fit overflow-x-auto p-2 no-scrollbar snap-x snap-mandatory">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(idx)}
                                className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all shrink-0 snap-center ${activeImage === idx ? "border-slate-900  ring-slate-700 shadow-md scale-105" : "border-transparent bg-white hover:border-gray-200"
                                    }`}
                            >
                                <Image src={getImgSrc(idx)} alt={`${product.name} thumbnail ${idx}`} fill unoptimized className="object-cover p-1 rounded-full" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Middle: Product Info */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-start justify-between">
                            <Link href={`/buy?brand=${product.brand}`} className="text-slate-700 text-xs font-black uppercase tracking-widest hover:underline">
                                {product.brand}
                            </Link>
                          
                        </div>
                        <h1 className="text-lg md:text-xl font-extrabold text-gray-900 leading-snug">
                            {product.name}
                        </h1>
                    </div>

                    <div className="p-5 md:p-6 rounded-3xl bg-white shadow-lg transition-all duration-300 flex flex-col gap-4">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <span className="text-lg md:text-2xl font-black text-gray-900">{formatCurrency(product.price)}</span>
                                {product.oldPrice && (
                                    <span className="text-sm md:text-lg text-gray-400 line-through">{formatCurrency(product.oldPrice)}</span>
                                )}
                             
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-3 border-t border-gray-50">
                            <p className="text-xs font-bold text-gray-900">Quantity</p>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center border border-gray-200 rounded-full py-1 px-2.5 gap-4 bg-gray-50/50">
                                    <button
                                        disabled={quantity <= 1}
                                        onClick={() => setQuantity(q => q - 1)}
                                        className="p-1 hover:text-blue-600 disabled:text-gray-300 transition-colors"
                                    >
                                        <Minus size={16} strokeWidth={2.5} />
                                    </button>
                                    <span className="w-6 text-center font-black text-base">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="p-1 hover:text-blue-600 transition-colors"
                                    >
                                        <Plus size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                                <span className="text-[11px] font-bold text-gray-400 italic">
                                    {product.stock > 0 ? `Only ${product.stock} items left!` : 'Out of stock'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <button
                                className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs md:text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-md disabled:bg-gray-300"
                                disabled={!product.inStock}
                                onClick={() => addToCart(product, quantity)}
                            >
                                ADD TO CART
                            </button>
                            <button className="bg-black hover:bg-gray-900 text-white font-black text-xs md:text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-md cursor-pointer">
                                <Phone size={16} />
                                WHATSAPP
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
                                        <p className="text-[10px] text-gray-500 mt-1">Ready for delivery within 24 hours to Accra, Kumasi, Takoradi, Tema, and other major cities</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="shrink-0 w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                        <Store size={18} className="text-gray-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-xs font-bold text-gray-900 leading-tight">Pick-up Station</p>
                                      
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-50">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">Seller Info</h3>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-blue-600 uppercase">Gadget CITi Official Store</span>
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

                  
                </div>
            </div>

            {/* Tabs Section */}
            <div className="max-w-4xl">
                <div className="flex gap-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`pb-4 text-[9px] md:text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === "overview" ? "text-slate-900" : "text-gray-400"
                            }`}
                    >
                        About & Specification
                        {activeTab === "overview" && (
                            <motion.div layoutId="activeTabLine" className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("ai")}
                        className={`pb-4 text-[9px] md:text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === "specs" ? "text-slate-900" : "text-gray-400"
                            }`}
                    >
                        Ai Review
                        {activeTab === "ai" && (
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
                                    <p className={`text-gray-600 leading-relaxed font-medium transition-all ${isExpanded ? "" : "line-clamp-3"}`}>
                                        {product.description}
                                    </p>
                                    {product.description && product.description.length > 100 && (
                                        <button 
                                            type="button"
                                            onClick={() => setIsExpanded(!isExpanded)} 
                                            className="mt-2 text-xs font-bold text-orange-500 hover:text-orange-600 transition cursor-pointer underline underline-offset-4"
                                        >
                                            {isExpanded ? "Show less" : "Show all"}
                                        </button>
                                    )}
                                </div>
                                {product.features && (
                                    <div className="flex flex-col gap-4">
                                        <h3 className="text-base font-black text-gray-900 uppercase tracking-widest">Key Features</h3>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {product.features.toString()?.split(',').map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                                    <CheckCircle2 size={18} className="text-slate-900 shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </motion.div>
                        ) : activeTab === "ai" ? (
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
                        ) : null}
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
