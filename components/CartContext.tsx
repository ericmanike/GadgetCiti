"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/lib/products";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthContext";

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

    // Initial local storage load (only for guests)
    useEffect(() => {
        setIsMounted(true);
        if (!user) {
            const savedCart = localStorage.getItem("letronix-cart");
            if (savedCart) {
                try {
                    setCart(JSON.parse(savedCart));
                } catch (e) {
                    console.error("Failed to parse cart", e);
                }
            }
        }
    }, [user]);

    // Retrieve from DB when user logs in
    useEffect(() => {
        if (user) {
            const fetchDBCart = async () => {
                try {
                    const { data, error } = await supabase
                        .from('cart_items')
                        .select('product_id, quantity, product_data')
                        .eq('user_id', user.id);

                    if (error) {
                        console.error("Error loading cart from DB:", error.message);
                        return;
                    }

                    if (data) {
                        const items: CartItem[] = data.map((row: any) => ({
                            product: row.product_data,
                            quantity: row.quantity
                        })).filter(item => item.product !== null);
                        setCart(items);
                    }
                } catch (err) {
                    console.error("Supabase cart load error:", err);
                } finally {
                    setIsCartLoadedFromDB(true);
                }
            };
            fetchDBCart();
        } else {
            setIsCartLoadedFromDB(false);
        }
    }, [user]);

    // Sync to local storage for guests
    useEffect(() => {
        if (isMounted && !user) {
            localStorage.setItem("letronix-cart", JSON.stringify(cart));
        }
    }, [cart, isMounted, user]);

    const syncItemToSupabase = async (product: Product, quantity: number) => {
        if (!user) return;
        try {
            const { data } = await supabase.from('cart_items')
                .select('id')
                .eq('user_id', user.id)
                .eq('product_id', product.id)
                .maybeSingle();

            if (data) {
                const { error } = await supabase.from('cart_items')
                    .update({ quantity, product_data: product })
                    .eq('id', data.id);
                if (error) console.error("Update cart error:", error.message);
            } else {
                const { error } = await supabase.from('cart_items')
                    .insert({
                        user_id: user.id,
                        product_id: product.id,
                        quantity,
                        product_data: product
                    });
                if (error) console.error("Insert cart error:", error.message);
            }
        } catch (err) {
            console.error("Supabase cart sync exception:", err);
        }
    }

    const removeItemFromSupabase = async (productId: string) => {
        if (!user) return;
        try {
            const { error } = await supabase.from('cart_items')
                .delete()
                .eq('user_id', user.id)
                .eq('product_id', productId);
            if (error) console.error("Remove cart error:", error.message);
        } catch (err) {
            console.error("Supabase cart auto remove exception:", err);
        }
    }

    const clearCartFromSupabase = async () => {
        if (!user) return;
        try {
            const { error } = await supabase.from('cart_items')
                .delete()
                .eq('user_id', user.id);
            if (error) console.error("Clear cart error:", error);
        } catch (err) {
            console.error("Supabase cart auto clearing exception:", err);
        }
    }

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

        toast.success(`Added ${product.name} to cart!`);

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
