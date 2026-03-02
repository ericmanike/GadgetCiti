'use client';
import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';

interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
}

const initialItems: CartItem[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    slug: 'iphone-15-pro-max',
    price: 1199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
    quantity: 1,
  },
  {
    id: '2',
    name: 'AirPods Pro (2nd Generation)',
    slug: 'bose-qc-ultra',
    price: 249.00,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
    quantity: 2,
  },
];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(initialItems);

  const updateQuantity = (id: string, delta: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = items.length > 0 ? 15.00 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen mt-20 bg-gray-100 pt-28 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/buy" className="text-orange-500 hover:text-orange-600 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">

            Your Shopping Cart ({items.length})
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <ShoppingCart size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Explore our gadgets and find the best deals!
            </p>
            <Link href="/buy">
              <button className="bg-orange-500 text-white px-10 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200">
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex gap-4 items-center animate-in fade-in slide-in-from-left-4 duration-300">
                  <Link href={`/products/${item.slug}`} className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100 hover:opacity-90 transition-opacity">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.slug}`}>
                      <h3 className="text-base md:text-lg font-bold text-slate-900 truncate hover:text-orange-500 transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-orange-500 font-bold mt-1">
                      {formatCurrency(item.price)}
                    </p>

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-2 hover:bg-white transition-colors text-slate-600"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-bold text-slate-900 border-x border-gray-200 py-1">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-2 hover:bg-white transition-colors text-slate-600"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between pr-2 self-stretch">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-0.5 font-medium italic">Subtotal</p>
                      <p className="text-base md:text-lg font-bold text-slate-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center p-4">
                <Link href="/buy" className="text-orange-500 font-bold flex items-center gap-2 hover:translate-x-[-4px] transition-transform">
                  <ArrowLeft size={18} />
                  Back to Shopping
                </Link>
                <button
                  onClick={() => setItems([])}
                  className="text-gray-400 hover:text-red-500 flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <Trash2 size={16} />
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Checkout Section */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-32">
                <h2 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-gray-100">
                  Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Subtotal</span>
                    <span className="text-slate-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Shipping Fee</span>
                    <span className="text-slate-900">{formatCurrency(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium italic">
                    <span>Estimated Tax</span>
                    <span className="text-slate-900">{formatCurrency(0)}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between">
                    <span className="text-lg font-bold text-slate-900">Total</span>
                    <span className="text-xl font-bold text-orange-500">{formatCurrency(total)}</span>
                  </div>
                </div>

                <Link href="/cart/checkout" className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] mb-4 text-center">
                  PROCEED TO CHECKOUT
                </Link>

                <div className="flex items-center justify-center gap-2 text-gray-400 text-xs text-center">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>Secure Checkout & Quality Guarantee</span>
                </div>
              </div>


            </div>
          </div>
        )}
      </div>
    </div>
  );
}
