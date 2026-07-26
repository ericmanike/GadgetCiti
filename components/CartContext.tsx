"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, mapDBProductToClient } from "@/lib/products";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthContext";
import { useToast } from "./toastProvider";

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const { user } = useAuth();
    const [isCartLoadedFromDB, setIsCartLoadedFromDB] = useState(false);
    const [isLoadingCart, setIsLoadingCart] = useState(false);
    const { showToast } = useToast();

    // Initial local storage load
    useEffect(() => {
        setIsMounted(true);
        const savedCart = localStorage.getItem("gadgetciti-cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Helper to get or create a cart for the user
    const getOrCreateCart = async (userId: string): Promise<string | number | null> => {
        try {
            const { data: cart, error: fetchError } = await supabase
                .from('carts')
                .select('id')
                .eq('user_id', userId)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (cart) {
                return cart.id;
            }

            const { data: newCart, error: createError } = await supabase
                .from('carts')
                .insert({ user_id: userId })
                .select('id')
                .single();

            if (createError) throw createError;
            return newCart.id;
        } catch (err) {
            console.error("Error in getOrCreateCart:", err);
            return null;
        }
    };

    // Retrieve from DB when user logs in; merge any local guest items into DB
    useEffect(() => {
        if (user) {
            const fetchDBCart = async () => {
                setIsLoadingCart(true);
                try {
                    const { data: cartData, error: cartError } = await supabase
                        .from('carts')
                        .select('id')
                        .eq('user_id', user.id)
                        .maybeSingle();

                    if (cartError) {
                        console.error("Error fetching cart from DB:", cartError.message);
                        return;
                    }

                    if (cartData) {
                        const { data: itemsData, error: itemsError } = await supabase
                            .from('cart_items')
                            .select(`
                                quantity,
                                products (
                                    id, name, brand, price, discount, stock, over_view, specifications, created_at,
                                    categories (name),
                                    product_images (image_url),
                                    reviews (rating)
                                )
                            `)
                            .eq('cart_id', cartData.id);

                        if (itemsError) {
                            console.error("Error loading cart items from DB:", itemsError.message);
                            return;
                        }

                        if (itemsData && itemsData.length > 0) {
                            // DB has items — use those as the source of truth
                            const dbItems: CartItem[] = itemsData.map((row: any) => {
                                if (!row.products) return null;
                                return {
                                    product: mapDBProductToClient(row.products),
                                    quantity: Number(row.quantity) || 1
                                };
                            }).filter((item): item is CartItem => item !== null);

                            // Merge any local guest items that aren't already in DB
                            const localCart = (() => {
                                try {
                                    const raw = localStorage.getItem("gadgetciti-cart");
                                    return raw ? (JSON.parse(raw) as CartItem[]) : [];
                                } catch { return []; }
                            })();

                            const merged = [...dbItems];
                            for (const localItem of localCart) {
                                const alreadyInDB = dbItems.find(i => i.product.id === localItem.product.id);
                                if (!alreadyInDB) {
                                    merged.push(localItem);
                                    // Persist merged guest item to DB
                                    syncItemToSupabaseRaw(cartData.id, localItem.product, localItem.quantity);
                                }
                            }
                            setCart(merged);
                        } else {
                            // DB cart exists but is empty — migrate local guest items into it
                            const localCart = (() => {
                                try {
                                    const raw = localStorage.getItem("gadgetciti-cart");
                                    return raw ? (JSON.parse(raw) as CartItem[]) : [];
                                } catch { return []; }
                            })();

                            if (localCart.length > 0) {
                                setCart(localCart);
                                for (const item of localCart) {
                                    syncItemToSupabaseRaw(cartData.id, item.product, item.quantity);
                                }
                            } else {
                                setCart([]);
                            }
                        }
                    } else {
                        // No DB cart at all — migrate local guest items into a new DB cart
                        const localCart = (() => {
                            try {
                                const raw = localStorage.getItem("gadgetciti-cart");
                                return raw ? (JSON.parse(raw) as CartItem[]) : [];
                            } catch { return []; }
                        })();

                        if (localCart.length > 0) {
                            setCart(localCart);
                            const cartId = await getOrCreateCart(user.id);
                            if (cartId) {
                                for (const item of localCart) {
                                    syncItemToSupabaseRaw(cartId, item.product, item.quantity);
                                }
                            }
                        } else {
                            setCart([]);
                        }
                    }
                } catch (err) {
                    console.error("Supabase cart load error:", err);
                } finally {
                    setIsCartLoadedFromDB(true);
                    setIsLoadingCart(false);
                }
            };
            fetchDBCart();
        } else {
            setIsCartLoadedFromDB(false);
            setIsLoadingCart(false);
        }
    }, [user]);

    // Sync to local storage
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("gadgetciti-cart", JSON.stringify(cart));
        }
    }, [cart, isMounted]);

    // Sync a single item using an already-known cartId (used during login merge)
    const syncItemToSupabaseRaw = async (cartId: string | number, product: Product, quantity: number) => {
        try {
            const { data } = await supabase.from('cart_items')
                .select('id')
                .eq('cart_id', cartId)
                .eq('product_id', Number(product.id))
                .maybeSingle();

            if (data) {
                const { error } = await supabase.from('cart_items')
                    .update({ quantity })
                    .eq('id', data.id);
                if (error) console.error("Update cart item error:", error.message);
            } else {
                const { error } = await supabase.from('cart_items')
                    .insert({ cart_id: cartId, product_id: Number(product.id), quantity });
                if (error) console.error("Insert cart item error:", error.message);
            }
        } catch (err) {
            console.error("Supabase cart sync (raw) exception:", err);
        }
    };

    const syncItemToSupabase = async (product: Product, quantity: number) => {
        if (!user) return;
        try {
            const cartId = await getOrCreateCart(user.id);
            if (!cartId) return;
            await syncItemToSupabaseRaw(cartId, product, quantity);
        } catch (err) {
            console.error("Supabase cart sync exception:", err);
        }
    };

    const removeItemFromSupabase = async (productId: string) => {
        if (!user) return;
        try {
            const { data: cart } = await supabase
                .from('carts')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (!cart) return;

            const { error } = await supabase.from('cart_items')
                .delete()
                .eq('cart_id', cart.id)
                .eq('product_id', Number(productId));

            if (error) console.error("Remove cart item error:", error.message);
        } catch (err) {
            console.error("Supabase cart auto remove exception:", err);
        }
    };

    const clearCartFromSupabase = async () => {
        if (!user) return;
        try {
            const { error } = await supabase.from('carts')
                .delete()
                .eq('user_id', user.id);

            if (error) console.error("Clear cart error:", error.message);
        } catch (err) {
            console.error("Supabase cart auto clearing exception:", err);
        }
    };

    const addToCart = async (product: Product, quantity: number = 1) => {
        let newQuantity = quantity;
        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                newQuantity = existing.quantity + quantity;
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            }
            return [...prev, { product, quantity: newQuantity }];
        });

        showToast(`Added ${product.name} to cart!`, "success");

        if (user) {
            await syncItemToSupabase(product, newQuantity);
        }
    };

    const removeFromCart = async (productId: string) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
        if (user) {
            await removeItemFromSupabase(productId);
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        if (quantity <= 0) {
            await removeFromCart(productId);
            return;
        }

        const productInCart = cart.find(item => item.product.id === productId);
        setCart((prev) =>
            prev.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item
            )
        );

        if (user && productInCart) {
            await syncItemToSupabase(productInCart.product, quantity);
        }
    };

    const clearCart = async () => {
        setCart([]);
        if (user) {
            await clearCartFromSupabase();
        }
    };

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce(
        (total, item) => total + ((item.product?.price || 0) * item.quantity),
        0
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
