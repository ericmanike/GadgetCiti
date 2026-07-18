'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, Tag, Users, Package, ArrowUpRight, Plus, Edit, Eye, Loader2, Sparkles, Trash2
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/toastProvider';
import { supabase } from '@/lib/supabase';
import { parseImageUrls } from '@/lib/products';

interface DashboardStats {
  productsCount: number;
  categoriesCount: number;
  usersCount: number;
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

interface RecentUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  created_at?: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    productsCount: 0,
    categoriesCount: 0,
    usersCount: 0,
    totalStock: 0
  });
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      // 1. Fetch counts
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const { count: categoriesCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Sum of stock from products
      const { data: stockData } = await supabase
        .from('products')
        .select('stock');
      
      const totalStock = stockData?.reduce((sum, item) => sum + Number(item.stock || 0), 0) || 0;

      setStats({
        productsCount: productsCount || 0,
        categoriesCount: categoriesCount || 0,
        usersCount: usersCount || 0,
        totalStock
      });

      // 2. Fetch Recent Products (limit to 5)
      const { data: dbProducts } = await supabase
        .from('products')
        .select(`
          id, name, price, stock,
          categories(name),
          product_images(image_url)
        `)
        .order('id', { ascending: false })
        .limit(5);

      const mappedProducts: RecentProduct[] = dbProducts?.map((row: any) => {
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

      // 3. Fetch Recent Users (limit to 5)
      const { data: dbUsers } = await supabase
        .from('users')
        .select('id, name, email')
        .limit(5);

      const ADMIN_EMAILS = ['manikeeric@gmail.com'];
      const mappedUsers: RecentUser[] = dbUsers?.map((row: any) => ({
        id: row.id,
        fullName: row.name || "Anonymous User",
        email: row.email || "No Email",
        role: row.email && ADMIN_EMAILS.includes(row.email.toLowerCase()) ? 'Admin' : 'Buyer/Seller'
      })) || [];

      setRecentUsers(mappedUsers);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteUser = async (id: string) => {
    try {
      setSubmitting(true);
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;

      showToast("User profile deleted successfully!", "success");
      setRecentUsers(prev => prev.filter(u => u.id !== id));
      setStats(prev => ({ ...prev, usersCount: Math.max(0, prev.usersCount - 1) }));
      setDeletingUserId(null);
    } catch (err: any) {
      console.error("Error deleting user:", err);
      showToast(err.message || "Failed to delete user.", "error");
    } finally {
      setSubmitting(false);
    }
  };

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
      title: 'Total Products',
      value: stats.productsCount,
      description: 'Listed gadgets on marketplace',
      icon: ShoppingBag,
      color: 'from-orange-500 to-amber-505',
      bgColor: 'bg-orange-50 border-orange-100 text-orange-600 shadow-xs',
    },
    {
      title: 'Categories',
      value: stats.categoriesCount,
      description: 'Active filter categories',
      icon: Tag,
      color: 'from-blue-500 to-indigo-505',
      bgColor: 'bg-blue-550/10 border-blue-200 text-blue-700 shadow-xs',
    },
    {
      title: 'Registered Users',
      value: stats.usersCount,
      description: 'Buyers and Sellers accounts',
      icon: Users,
      color: 'from-emerald-500 to-teal-505',
      bgColor: 'bg-emerald-550/10 border-emerald-200 text-emerald-700 shadow-xs',
    },
    {
      title: 'Available Stock',
      value: stats.totalStock,
      description: 'Total unit inventory items',
      icon: Package,
      color: 'from-fuchsia-500 to-pink-505',
      bgColor: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-600 shadow-xs',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-slate-800">
      
      {/* Header Overview */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Dashboard Overview 
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Real-time business insights, stock logs, and user registration analytics.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products">
            <button className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl transition duration-200 shadow-lg shadow-orange-500/25 text-sm cursor-pointer">
              <Plus size={16} />
              <span>Add Product</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2  lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-[10px] p-4 shadow-xs relative overflow-hidden group hover:border-slate-300 transition duration-250">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className=" text-[12px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{card.title}</p>
                <h3 className="text-3xl font-black text-slate-900">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl border ${card.bgColor}`}>
                <card.icon size={12} strokeWidth={2} />
              </div>
            </div>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Split Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Products Listed */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Recent Products Listed</h2>
              <p className="text-xs text-slate-500">Latest gadgets available for purchase</p>
            </div>
            <Link href="/admin/products">
              <button className="flex items-center space-x-1 text-orange-500 hover:text-orange-600 text-xs font-bold transition cursor-pointer">
                <span>Manage all</span>
                <ArrowUpRight size={14} />
              </button>
            </Link>
          </div>

          <div className="flex-1 divide-y divide-slate-100">
            {recentProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
                <ShoppingBag className="w-10 h-10 mb-2 opacity-50 text-orange-500" />
                <p>No products listed yet.</p>
              </div>
            ) : (
              recentProducts.map((prod) => (
                <div key={prod.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0 gap-4 group">
                  <div className="flex items-center space-x-3 truncate">
                    <img 
                      src={prod.imageUrl} 
                      alt={prod.name} 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" 
                    />
                    <div className="truncate">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-orange-500 transition-colors truncate">{prod.name}</p>
                      <span className="inline-block text-[9px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-0.5">{prod.category}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900 font-bold">GHS {prod.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <span className={`text-[10px] font-bold ${prod.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <Link href="/admin/products">
                      <button className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-650 rounded-lg transition cursor-pointer border border-slate-200" title="Edit Product">
                        <Edit size={14} />
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Registered Users */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Recent User Registrations</h2>
              <p className="text-xs text-slate-500">Newly registered user profiles</p>
            </div>
            <Link href="/admin/users">
              <button className="flex items-center space-x-1 text-orange-500 hover:text-orange-650 text-xs font-bold transition cursor-pointer">
                <span>Manage all</span>
                <ArrowUpRight size={14} />
              </button>
            </Link>
          </div>

          <div className="flex-1 divide-y divide-slate-100">
            {recentUsers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
                <Users className="w-10 h-10 mb-2 opacity-50 text-orange-500" />
                <p>No registered users found.</p>
              </div>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0 gap-4">
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-700 font-bold shrink-0">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                      user.role === 'Admin' 
                        ? 'bg-rose-50 border border-rose-100 text-rose-700' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {user.role}
                    </span>
                    <button 
                      onClick={() => setDeletingUserId(user.id)}
                      className="p-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-lg transition cursor-pointer border border-slate-200"
                      title="Delete User"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Delete User Modal */}
      {deletingUserId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Delete User Account</h3>
            <p className="text-slate-550 text-sm leading-relaxed">
              Are you sure you want to permanently delete this user profile? This will remove their record from the database.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                disabled={submitting}
                onClick={() => setDeletingUserId(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 text-sm font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={() => deletingUserId && handleDeleteUser(deletingUserId)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition cursor-pointer shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting ? <Spinner className="size-3.5" /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
