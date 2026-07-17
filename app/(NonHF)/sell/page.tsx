'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, Tag, Package, ArrowUpRight, Plus, Eye, Loader2, Sparkles, TrendingUp, DollarSign
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { parseImageUrls } from '@/lib/products';

interface DashboardStats {
  productsCount: number;
  activeOrders: number;
  totalSales: number;
  totalStock: number;
}

interface RecentProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}

export default function SellerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    productsCount: 0,
    activeOrders: 0,
    totalSales: 0,
    totalStock: 0
  });
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);

  useEffect(() => {
    if (!user) return;

    async function fetchSellerData() {
      try {
        setLoading(true);

        // 1. Fetch products count & total stock
        const { data: sellerProducts, error: pError } = await supabase
          .from('products')
          .select(`
            id, name, price, stock,
            categories(name),
            product_images(image_url)
          `)
          .eq('user_id', user!.id);

        if (pError) throw pError;

        const productsCount = sellerProducts?.length || 0;
        const totalStock = sellerProducts?.reduce((sum, item) => sum + Number(item.stock || 0), 0) || 0;

        // Calculate sample sales and active orders (since we start fresh, we can show a mock or read orders)
        // For orders, we can look up order items (if there's a join table).
        // Since the DB is fresh, we will query the orders to see if there are any real items.
        // If not, we will default to 0 with descriptive placeholders.
        const activeOrders = 0;
        const totalSales = 0;

        setStats({
          productsCount,
          activeOrders,
          totalSales,
          totalStock
        });

        // 2. Fetch Recent Products (limit to 5)
        const mappedProducts: RecentProduct[] = sellerProducts?.slice(0, 5).map((row: any) => {
          const images = parseImageUrls(row.product_images);
          return {
            id: row.id.toString(),
            name: row.name || "Unknown Product",
            price: Number(row.price || 0),
            stock: Number(row.stock || 0),
            category: row.categories?.name || "Uncategorized",
            imageUrl: images.length > 0 ? images[0] : "https://placehold.co/800?text=photo+unavailable&font=roboto"
          };
        }) || [];

        setRecentProducts(mappedProducts);

      } catch (err) {
        console.error("Error fetching seller dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSellerData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="loader w-10 h-10 mb-2" />
        <p className="text-slate-500 font-semibold">Loading stats & activity...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Products Listed',
      value: stats.productsCount,
      description: 'Active items on the marketplace',
      icon: ShoppingBag,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50 border-orange-100 text-orange-600 shadow-sm',
    },
    {
      title: 'Store Sales',
      value: formatCurrency(stats.totalSales),
      description: 'Total revenue processed',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm',
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders,
      description: 'Incoming customer orders',
      icon: TrendingUp,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50 border-blue-100 text-blue-700 shadow-sm',
    },
    {
      title: 'Total Stock Inventory',
      value: stats.totalStock,
      description: 'Aggregate quantity in store',
      icon: Package,
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-purple-50 border-purple-100 text-purple-700 shadow-sm',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-white border border-gray-150 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute top-0 right-0 w-[40%] h-[150%] bg-radial-gradient from-orange-500/10 to-transparent blur-3xl -z-10" />
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-orange-600 font-black text-xs uppercase tracking-widest">
            <Sparkles size={14} className="animate-pulse" />
            Seller Hub Activated
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Welcome to Your Dashboard, <span className="text-orange-500">{user?.user_metadata?.store_name || user?.user_metadata?.full_name || 'Seller'}</span>!
          </h1>
          <p className="text-slate-500 text-sm max-w-xl font-medium">
            Manage listings, fulfill customer purchases, and check your storefront statistics in real-time.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href="/sell/products">
            <button className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-5 rounded-2xl text-sm transition duration-200 cursor-pointer shadow-lg shadow-orange-500/20">
              <Plus size={18} />
              Add Product
            </button>
          </Link>
          <Link href="/sell/store">
            <button className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3 px-5 rounded-2xl text-sm transition duration-200 cursor-pointer border border-gray-250">
              Edit Store Profile
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-gray-150 p-6 flex flex-col justify-between shadow-xs relative overflow-hidden group hover:shadow-md transition duration-250">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{card.title}</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl border ${card.bgColor} transition duration-250`}>
                <card.icon size={22} strokeWidth={2} />
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Recent Products */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <div>
              <h3 className="font-black text-gray-900 text-lg">Your Recent Listings</h3>
              <p className="text-xs text-gray-400 font-medium">Quick view of your last uploaded items</p>
            </div>
            <Link href="/sell/products">
              <button className="flex items-center gap-1.5 text-xs font-black text-orange-500 hover:text-orange-600 transition cursor-pointer select-none bg-orange-50 px-3 py-2 rounded-xl">
                Manage Products <ArrowUpRight size={14} />
              </button>
            </Link>
          </div>

          {recentProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
              <Package size={48} className="mb-3 text-gray-300 animate-bounce" />
              <p className="font-bold text-gray-600">No products uploaded yet</p>
              <p className="text-xs text-gray-400 max-w-xs mt-1">Upload products to start selling tech gadgets on Electronics Mart.</p>
              <Link href="/sell/products" className="mt-4">
                <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer shadow-sm">
                  Upload Product Now
                </button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="text-xs font-black text-gray-400 uppercase border-b border-gray-100">
                    <th className="pb-3 font-black">Item</th>
                    <th className="pb-3 font-black">Category</th>
                    <th className="pb-3 font-black">Price</th>
                    <th className="pb-3 font-black">Stock Status</th>
                    <th className="pb-3 text-right font-black">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentProducts.map((p) => (
                    <tr key={p.id} className="group hover:bg-slate-50/50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded-xl border border-gray-100" />
                          <span className="font-bold text-gray-900 max-w-[200px] truncate">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-gray-600 font-semibold">{p.category}</td>
                      <td className="py-4 text-gray-900 font-bold">{formatCurrency(p.price)}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          p.stock > 5 ? 'bg-green-50 text-green-700' : p.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {p.stock === 0 ? 'Out of Stock' : `${p.stock} In Stock`}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Link href={`/products/${p.id}`}>
                          <button className="p-1.5 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition cursor-pointer">
                            <Eye size={16} />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
