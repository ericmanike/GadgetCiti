'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, X } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/lib/products';
import { formatCurrency } from '@/lib/utils';

interface SearchDropdownProps {
    query: string;
    results: Product[];
    isOpen: boolean;
    onClose: () => void;
    onClear: () => void;
}

const TRENDING = ['iPhone 15', 'MacBook Pro', 'AirPods', 'Samsung Galaxy', 'Gaming Laptops'];

export default function SearchDropdown({
    query,
    results,
    isOpen,
    onClose,
    onClear,
}: SearchDropdownProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                key="search-dropdown"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
            >
                {/* No query – show trending */}
                {!query && (
                    <div className="p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                            <TrendingUp size={12} /> Trending Searches
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {TRENDING.map((term) => (
                                <button
                                    key={term}
                                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 hover:bg-[#f0f0f0] hover:text-orange-600 transition-colors"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Has query – show results */}
                {query && (
                    <>
                        {results.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
                                <Search size={32} strokeWidth={1.5} />
                                <p className="text-sm font-semibold">No results for &ldquo;{query}&rdquo;</p>
                                <p className="text-xs">Try a different keyword</p>
                            </div>
                        ) : (
                            <ul className="py-2 max-h-80 overflow-y-auto divide-y divide-gray-50">
                                {results.slice(0, 6).map((product) => (
                                    <li key={product.id}>
                                        <Link
                                            href={`/products/${product.slug}`}
                                            onClick={onClose}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-[#f0f0f0] transition-colors group"
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black uppercase tracking-widest text-orange-500">
                                                    {product.brand}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-gray-500">{product.category}</p>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-black text-gray-900">
                                                    {formatCurrency(product.price)}
                                                </p>
                                                {product.oldPrice && (
                                                    <p className="text-[10px] text-gray-400 line-through">
                                                        {formatCurrency(product.oldPrice)}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Footer – view all */}
                        {results.length > 0 && (
                            <div className="border-t border-gray-100 px-4 py-3">
                                <Link
                                    href={`/buy?search=${encodeURIComponent(query)}`}
                                    onClick={onClose}
                                    className="flex items-center justify-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
                                >
                                    <Search size={13} />
                                    See all results for &ldquo;{query}&rdquo;
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
