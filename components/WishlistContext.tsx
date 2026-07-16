"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/lib/products";
import { toast } from "sonner";

interface WishlistContextType {
    wishlist: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string) => void;
    toggleWishlist: (product: Product) => void;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
    totalWishlistItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const saved = localStorage.getItem("gadgetciti-wishlist");
        if (saved) {
            try {
                setWishlist(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse wishlist from localStorage:", e);
            }
        }
    }, []);

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("gadgetciti-wishlist", JSON.stringify(wishlist));
        }
    }, [wishlist, isMounted]);

    const addToWishlist = (product: Product) => {
        setWishlist((prev) => {
            if (prev.some((item) => item.id === product.id)) return prev;
            toast.success(`${product.name} saved to your wishlist!`);
            return [...prev, product];
        });
    };

    const removeFromWishlist = (productId: string) => {
        setWishlist((prev) => {
            const existing = prev.find((item) => item.id === productId);
            if (existing) {
                toast.info(`${existing.name} removed from your wishlist.`);
            }
            return prev.filter((item) => item.id !== productId);
        });
    };

    const toggleWishlist = (product: Product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some((item) => item.id === productId);
    };

    const clearWishlist = () => {
        setWishlist([]);
        toast.info("Wishlist cleared.");
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                addToWishlist,
                removeFromWishlist,
                toggleWishlist,
                isInWishlist,
                clearWishlist,
                totalWishlistItems: wishlist.length,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}
