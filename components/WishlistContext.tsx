"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Product, mapDBProductToClient } from "@/lib/products";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
    wishlist: Product[];
    addToWishlist: (product: Product) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    toggleWishlist: (product: Product) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => Promise<void>;
    totalWishlistItems: number;
    loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isMounted, setIsMounted] = useState<boolean>(false);

    const loadWishlist = useCallback(async () => {
        setLoading(true);
        if (user) {
            try {
                // Check for un-synced items from localStorage before loading
                const savedLocal = localStorage.getItem("gadgetciti-wishlist");
                if (savedLocal) {
                    try {
                        const localItems: Product[] = JSON.parse(savedLocal);
                        if (localItems.length > 0) {
                            const inserts = localItems
                                .map((item) => parseInt(item.id, 10))
                                .filter((id) => !isNaN(id))
                                .map((productId) => ({
                                    user_id: user.id,
                                    product_id: productId,
                                }));
                            if (inserts.length > 0) {
                                await supabase
                                    .from("saved_items")
                                    .upsert(inserts, { onConflict: "user_id,product_id" });
                            }
                        }
                        localStorage.removeItem("gadgetciti-wishlist");
                    } catch (e) {
                        console.error("Error syncing local wishlist to Supabase:", e);
                    }
                }

                // Fetch saved items from Supabase
                const { data, error } = await supabase
                    .from("saved_items")
                    .select(`
                        product_id,
                        products (
                            id, name, brand, price, stock, over_view, specifications, created_at,
                            categories(name),
                            product_images(image_url),
                            reviews(rating)
                        )
                    `)
                    .eq("user_id", user.id);

                if (error) {
                    console.error("Error fetching saved_items from Supabase:", error);
                } else if (data) {
                    const items: Product[] = data
                        .filter((item: any) => item.products)
                        .map((item: any) => mapDBProductToClient(item.products));
                    setWishlist(items);
                }
            } catch (err) {
                console.error("Failed to load saved items:", err);
            }
        } else {
            // Load from localStorage for guests
            const saved = localStorage.getItem("gadgetciti-wishlist");
            if (saved) {
                try {
                    setWishlist(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse wishlist from localStorage:", e);
                }
            } else {
                setWishlist([]);
            }
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        setIsMounted(true);
        loadWishlist();
    }, [loadWishlist]);

    // Save to localStorage when unauthenticated
    useEffect(() => {
        if (isMounted && !user) {
            localStorage.setItem("gadgetciti-wishlist", JSON.stringify(wishlist));
        }
    }, [wishlist, isMounted, user]);

    const addToWishlist = async (product: Product) => {
        setWishlist((prev) => {
            if (prev.some((item) => item.id === product.id)) return prev;
            return [...prev, product];
        });
        toast.success(`${product.name} saved to your wishlist!`);

        if (user) {
            const prodId = parseInt(product.id, 10);
            if (!isNaN(prodId)) {
                const { error } = await supabase.from("saved_items").upsert(
                    {
                        user_id: user.id,
                        product_id: prodId,
                    },
                    { onConflict: "user_id,product_id" }
                );
                if (error) {
                    console.error("Error adding to saved_items in Supabase:", error);
                }
            }
        }
    };

    const removeFromWishlist = async (productId: string) => {
        setWishlist((prev) => {
            const existing = prev.find((item) => item.id === productId);
            if (existing) {
                toast.info(`${existing.name} removed from your wishlist.`);
            }
            return prev.filter((item) => item.id !== productId);
        });

        if (user) {
            const prodId = parseInt(productId, 10);
            if (!isNaN(prodId)) {
                const { error } = await supabase
                    .from("saved_items")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("product_id", prodId);
                if (error) {
                    console.error("Error removing from saved_items in Supabase:", error);
                }
            }
        }
    };

    const toggleWishlist = async (product: Product) => {
        if (isInWishlist(product.id)) {
            await removeFromWishlist(product.id);
        } else {
            await addToWishlist(product);
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some((item) => item.id === productId);
    };

    const clearWishlist = async () => {
        setWishlist([]);
        toast.info("Wishlist cleared.");

        if (user) {
            const { error } = await supabase
                .from("saved_items")
                .delete()
                .eq("user_id", user.id);
            if (error) {
                console.error("Error clearing saved_items in Supabase:", error);
            }
        }
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
                loading,
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
