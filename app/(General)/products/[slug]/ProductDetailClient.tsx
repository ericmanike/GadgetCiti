"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Phone,
    MapPin,
    Heart,
    ChevronRight,
    ChevronLeft,
    Minus,
    Plus,
    CheckCircle2,
    MessageSquare,
    Sparkles,
    Bot,
    X,
    Maximize2
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { addToCart } = useCart();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [product.id]);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isModalOpen]);

     const validImages = parseImageUrls(product?.images);
    const images = validImages.length > 0 ? validImages : ["https://placehold.co/800?text=photo+unavailable&font=roboto"];
    const [imgError, setImgError] = useState<Record<number, boolean>>({});


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isModalOpen) return;
            if (e.key === "Escape") setIsModalOpen(false);
            if (e.key === "ArrowLeft") setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
            if (e.key === "ArrowRight") setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isModalOpen, images?.length]);

   
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
        <div className="flex flex-col gap-2 md:gap-8 mt-8 md:mt-2 px-6 md:px-0 ">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[12px] md:text-[16px] md:text-sm text-gray-500 font-medium">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <ChevronRight size={12} />
                <Link href="/buy" className="hover:text-blue-600">Shop now</Link>
                <ChevronRight size={12} />
                <span className="text-gray-900 truncate">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Left: Image Gallery */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div 
                        onClick={() => setIsModalOpen(true)}
                        className="aspect-square relative rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 group cursor-pointer"
                        title="Click to view full image"
                    >
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

                        {/* Expand Hint on Hover */}
                        <div className="absolute bottom-2.5 left-2.5 z-20 bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all opacity-0 group-hover:opacity-100 shadow-md">
                            <Maximize2 size={13} />
                            <span>Click to enlarge</span>
                        </div>

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
                                    sizes="(max-width: 1024px) 100vw, 33vw"
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
                                <Image src={getImgSrc(idx)} alt={`${product.name} thumbnail ${idx}`} fill sizes="56px" unoptimized className="object-cover p-1 rounded-full" />
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
                                className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs md:text-sm py-3.5 md:py-4 px-4 rounded-xl flex 
                                items-center justify-center gap-2.5 transition-all active:scale-95 shadow-md
                                 disabled:bg-gray-300 cursor-pointer"
                                disabled={!product.inStock}
                                onClick={() => addToCart(product, quantity)}
                            >
                                ADD TO CART
                            </button>
                            <button
                                onClick={() => {
                                    const text = encodeURIComponent(`Hello, I want to inquire about ${product.name} (${formatCurrency(product.price)})`);
                                    window.open(`https://wa.me/?text=${text}`, '_blank');
                                }}
                                className="bg-black hover:bg-gray-900 text-white font-black text-xs md:text-sm py-3.5 md:py-4 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-md cursor-pointer"
                            >
                                <Phone size={16} />
                                WHATSAPP
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Shipping & Seller Sidebar */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="p-6 rounded-3xl bg-white shadow-lg border border-slate-100 flex flex-col gap-5">
                        {/* Store Header */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-orange-500/20 shrink-0">
                                G
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <h3 className="text-sm font-black text-slate-900 truncate">Gadget CITi Official</h3>
                                    <CheckCircle2 size={16} className="text-blue-500 shrink-0 fill-blue-500/10" />
                                </div>
                                <span className="text-[11px] font-bold text-orange-500">Verified Partner Store</span>
                            </div>
                        </div>

                        {/* Store Location */}
                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-xl text-xs font-semibold">
                            <MapPin size={15} className="text-orange-500 shrink-0" />
                            <span>Kumasi, KNUST Campus</span>
                        </div>

                        {/* Store Metrics Stats */}
                        <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-black text-slate-900">4.9 ★</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Rating</span>
                            </div>
                            <div className="flex flex-col items-center border-x border-slate-200">
                                <span className="text-xs font-black text-slate-900">98%</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Positive</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-black text-slate-900">10k+</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Followers</span>
                            </div>
                        </div>

                        {/* Store Action Buttons */}
                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                            <button
                                onClick={() => {
                                    const text = encodeURIComponent(`Hello! I am chatting regarding ${product.name} on Letronix.`);
                                    window.open(`https://wa.me/?text=${text}`, '_blank');
                                }}
                                className="w-full py-2.5 px-3 bg-[#632CF5] hover:bg-[#5223cb] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
                            >
                                <MessageSquare size={14} />
                                <span>Chat</span>
                            </button>
                            <button className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer">
                                <Plus size={14} className="text-orange-500" />
                                <span>Follow</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="mt-12 lg:mt-16 max-w-4xl">
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
                        className={`pb-4 text-[9px] md:text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === "ai" ? "text-slate-900" : "text-gray-400"
                            }`}
                    >
                        AI Review & Insights
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
                                {product.specifications && product.specifications.length > 0 && (
                                    <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                                        <h3 className="text-base font-black text-gray-900 uppercase tracking-widest">Specifications</h3>
                                        <div className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs">
                                            {product.specifications.map((spec, i) => (
                                                <div key={i} className={`flex p-3.5 ${i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}`}>
                                                    <span className="w-1/3 text-xs font-bold text-gray-500 uppercase tracking-wider">{spec.label}</span>
                                                    <span className="w-2/3 text-xs font-black text-gray-900">{spec.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : activeTab === "ai" ? (
                            <motion.div
                                key="ai"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col gap-4"
                            >
                                {product.aiRecommendation ? (
                                    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-xl flex flex-col gap-4">
                                        <div className="flex items-center gap-2.5 text-orange-400 font-extrabold text-xs uppercase tracking-widest">
                                
                                            <span>AI Review & Insight</span>
                                        </div>
                                        <p className="text-slate-200 leading-relaxed text-sm md:text-base font-medium">
                                            {product.aiRecommendation}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center   flex flex-col items-center justify-center gap-3">
                                        <div className="p-3 bg-slate-100 text-slate-500 rounded-2xl">
                                            <Bot className="size-6" />
                                        </div>
                                        <p className="text-gray-700 font-bold text-sm">AI recommendation coming soon</p>
                                        <span className="text-xs text-gray-400 font-medium">AI insights are automatically generated for select items.</span>
                                    </div>
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
            {/* Transparent Fullscreen Image Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-8"
                        onClick={() => setIsModalOpen(false)}
                    >
                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-5 right-5 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer border border-white/10"
                            aria-label="Close fullscreen image"
                        >
                            <X size={24} strokeWidth={2.5} />
                        </button>

                        {/* Previous Button */}
                        {images.length > 1 && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                                }}
                                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer border border-white/10"
                                aria-label="Previous image"
                            >
                                <ChevronLeft size={26} strokeWidth={2.5} />
                            </button>
                        )}

                        {/* Full Image Wrapper */}
                        <div
                            className="relative max-w-5xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center p-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImage}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    src={getImgSrc(activeImage)}
                                    alt={`${product.name} - view ${activeImage + 1}`}
                                    className="max-h-[80vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
                                    onError={() => setImgError((prev) => ({ ...prev, [activeImage]: true }))}
                                />
                            </AnimatePresence>

                            {/* Counter & Controls Indicator */}
                            {images.length > 1 && (
                                <div className="mt-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
                                    {activeImage + 1} / {images.length}
                                </div>
                            )}
                        </div>

                        {/* Next Button */}
                        {images.length > 1 && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                                }}
                                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer border border-white/10"
                                aria-label="Next image"
                            >
                                <ChevronRight size={26} strokeWidth={2.5} />
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
