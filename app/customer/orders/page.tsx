'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Package, Calendar, Clock, ChevronRight, RefreshCw, MapPin, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  user_id?: string | null;
  user_email?: string;
  user_name?: string;
  user_phone?: string;
  delivery_address?: string;
  items: OrderItem[];
  isLocal?: boolean;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchCustomerOrders = async () => {
    setLoading(true);
    let databaseOrders: Order[] = [];

    // Fetch directly from Supabase orders database
    try {
      let query = supabase.from('orders').select(`
        id,
        created_at,
        total,
        status,
        user_id,
        order_items (
          id,
          quantity,
          price,
          products (
            id,
            name,
            brand,
            product_images (
              image_url
            )
          )
        )
      `).order('created_at', { ascending: false });

      if (user?.id) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        databaseOrders = data.map((row: any) => ({
          id: String(row.id),
          created_at: row.created_at || new Date().toISOString(),
          total: Number(row.total) || 0,
          status: row.status || 'Paid',
          items: (row.order_items || []).map((item: any) => ({
            id: item.id,
            name: item.products?.name || 'Gadget Product',
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            image: item.products?.product_images?.[0]?.image_url || ''
          }))
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch orders exception:', e);
    }

    setOrders(databaseOrders);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomerOrders();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('paid') || s.includes('delivered') || s.includes('success')) {
      return { label: 'Paid / Delivered', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle };
    }
    if (s.includes('shipped') || s.includes('processing')) {
      return { label: 'Processing & Shipping', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Truck };
    }
    if (s.includes('cancel')) {
      return { label: 'Cancelled', bg: 'bg-red-50 text-red-700 border-red-200', icon: AlertCircle };
    }
    return { label: 'Order Confirmed', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm min-h-[80vh] border border-gray-150 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">My Orders</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">Track your purchases and view order history</p>
        </div>
        <button
          onClick={fetchCustomerOrders}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-orange-500' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Content Feed */}
      <div className="p-4 md:p-6 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner className="w-8 h-8 text-orange-500 mb-3" />
            <p className="text-sm font-semibold text-slate-500">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 md:py-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-4 shadow-sm border border-orange-100">
              <ShoppingBag size={36} />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">You have no orders yet!</h2>
            <p className="text-xs md:text-sm text-slate-600 mb-6 max-w-sm leading-relaxed">
              All your placed orders and receipts will appear here so you can track delivery progress.
            </p>
            <Link href="/buy">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer">
                Start Shopping Now
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              const StatusIcon = statusInfo.icon;
              return (
                <div
                  key={order.id}
                  className="border border-slate-200 rounded-2xl p-4 md:p-5 hover:border-orange-200 transition-all bg-white shadow-2xs hover:shadow-sm flex flex-col gap-4"
                >
                  {/* Order Top Line */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs md:text-sm font-bold text-slate-900">
                            Order #{order.id.slice(-8)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] md:text-xs text-slate-500 mt-0.5">
                          <Calendar size={12} />
                          <span>{new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg}`}>
                        <StatusIcon size={13} />
                        <span>{statusInfo.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Itemized summary */}
                  <div className="space-y-2">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs md:text-sm py-1">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-slate-100 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">
                              📦
                            </div>
                          )}
                          <span className="font-semibold text-slate-800 truncate">{item.name}</span>
                          <span className="text-slate-500 font-medium">× {item.quantity}</span>
                        </div>
                        <span className="font-bold text-slate-900 shrink-0 ml-2">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-slate-400 font-medium italic">+ {order.items.length - 3} more items...</p>
                    )}
                  </div>

                  {/* Order Footer & Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 bg-slate-50/50 -mx-4 -mb-4 md:-mx-5 md:-mb-5 p-4 rounded-b-2xl">
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">Total Amount</span>
                      <span className="text-base md:text-lg font-black text-slate-900">{formatCurrency(order.total)}</span>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <span>View Receipt</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="text-base md:text-lg font-bold">Order Details</h3>
                <p className="text-xs text-slate-300 font-mono mt-0.5">Ref: {selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-800">
              <div className="flex items-center justify-between p-3.5 bg-orange-50 border border-orange-100 rounded-2xl">
                <span className="text-xs font-bold text-orange-900 uppercase tracking-wider">Status</span>
                <span className="text-xs font-black text-orange-600 uppercase">{selectedOrder.status}</span>
              </div>

              {selectedOrder.delivery_address && (
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <MapPin size={14} className="text-orange-500" />
                    <span>Delivery Location</span>
                  </div>
                  <p className="text-xs font-medium text-slate-800 pl-5">{selectedOrder.delivery_address}</p>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Items Purchased</span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/40">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs md:text-sm">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold shrink-0">
                            📦
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">{formatCurrency(item.price)} × {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-black text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Total Paid:</span>
                <span className="text-xl font-black text-slate-900">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
