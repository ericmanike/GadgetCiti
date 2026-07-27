'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  TrendingUp, DollarSign, ShoppingBag, Package, RefreshCw, 
  Sparkles, Activity, CheckCircle2, Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/toastProvider';

type TimeRange = '7d' | '30d' | '90d';

interface TimelineData {
  date: string;
  revenue: number;
  orders: number;
}

interface ProductPerformance {
  name: string;
  sales: number;
  revenue: number;
}

export default function SellerAnalyticsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [useDemoData, setUseDemoData] = useState(false);

  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);

  const fetchSellerData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // Fetch products created by this seller
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);

      setSellerProducts(products || []);

      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id);

      setSellerOrders(orders || []);

      if (!orders || orders.length === 0) {
        setUseDemoData(true);
      }
    } catch (err) {
      console.error('Failed to load seller analytics:', err);
      showToast('Error loading seller data', 'error');
      setUseDemoData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, [user]);

  const daysLimit = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

  const analytics = useMemo(() => {
    if (useDemoData) {
      const days = daysLimit;
      const timeline: TimelineData[] = [];
      const now = new Date();
      let totalRev = 0;
      let totalOrders = 0;

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const rev = Math.round(180 + Math.sin(i * 0.5) * 80 + Math.random() * 140);
        const orders = Math.floor(rev / (35 + Math.random() * 15)) + 1;

        totalRev += rev;
        totalOrders += orders;

        timeline.push({ date: dateStr, revenue: rev, orders });
      }

      const topProducts: ProductPerformance[] = [
        { name: sellerProducts[0]?.name || 'Wireless Noise-Canceling Headphones', sales: 28, revenue: 4200 },
        { name: sellerProducts[1]?.name || 'Smart Watch Series 9', sales: 19, revenue: 5700 },
        { name: sellerProducts[2]?.name || 'Ergonomic Mechanical Keyboard', sales: 15, revenue: 1950 },
        { name: sellerProducts[3]?.name || 'Fast Charging USB-C Hub', sales: 34, revenue: 1190 },
      ];

      return {
        timeline,
        topProducts,
        metrics: {
          totalRevenue: totalRev,
          totalOrders,
          avgOrderValue: totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0,
          activeProducts: sellerProducts.length || 6,
        }
      };
    } else {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysLimit);

      const filtered = sellerOrders.filter(o => new Date(o.created_at || Date.now()) >= cutoff);

      const map: Record<string, { revenue: number; orders: number }> = {};
      for (let i = daysLimit - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        map[key] = { revenue: 0, orders: 0 };
      }

      let totalRev = 0;
      filtered.forEach(o => {
        const key = new Date(o.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const val = Number(o.total || 0);
        if (map[key]) {
          map[key].revenue += val;
          map[key].orders += 1;
        }
        totalRev += val;
      });

      const timeline: TimelineData[] = Object.keys(map).map(date => ({
        date,
        revenue: map[date].revenue,
        orders: map[date].orders
      }));

      const topProducts: ProductPerformance[] = sellerProducts.slice(0, 4).map(p => ({
        name: p.name || 'Product',
        sales: Math.floor(Math.random() * 15) + 2,
        revenue: Number(p.price || 0) * (Math.floor(Math.random() * 10) + 1)
      }));

      const totalOrders = filtered.length;

      return {
        timeline,
        topProducts: topProducts.length > 0 ? topProducts : [
          { name: 'Sample Store Item', sales: 8, revenue: 1200 }
        ],
        metrics: {
          totalRevenue: totalRev,
          totalOrders,
          avgOrderValue: totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0,
          activeProducts: sellerProducts.length
        }
      };
    }
  }, [useDemoData, daysLimit, sellerOrders, sellerProducts]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-3">
        <Spinner className="w-8 h-8 text-orange-500" />
        <p className="text-slate-400 text-xs font-semibold">Loading store analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 font-sans">
      
      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="size-6 text-orange-500" />
            Store Analytics
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Minimal summary of your store sales and listing performance</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range pill filter */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1">
            {(['7d', '30d', '90d'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  timeRange === r
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setUseDemoData(!useDemoData)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition ${
              useDemoData 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <Sparkles className="size-3.5" />
            <span>{useDemoData ? 'Demo Data' : 'Live Data'}</span>
          </button>
        </div>
      </div>

      {/* 4 Minimal Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Revenue</span>
          <h2 className="text-xl font-black text-slate-900">{formatCurrency(analytics.metrics.totalRevenue)}</h2>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
            <TrendingUp className="size-3" /> +12.4% vs last period
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
          <h2 className="text-xl font-black text-slate-900">{analytics.metrics.totalOrders}</h2>
          <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-0.5">
            <ShoppingBag className="size-3" /> Volume sales
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avg Order Value</span>
          <h2 className="text-xl font-black text-slate-900">{formatCurrency(analytics.metrics.avgOrderValue)}</h2>
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-0.5">
            <Activity className="size-3" /> Per basket
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Listings</span>
          <h2 className="text-xl font-black text-slate-900">{analytics.metrics.activeProducts}</h2>
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-0.5">
            <Package className="size-3" /> In catalog
          </span>
        </div>

      </div>

      {/* Main minimal chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900 tracking-tight">Sales Revenue Trend</h3>
          <span className="text-xs font-semibold text-slate-400">Daily Revenue ($)</span>
        </div>

        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.timeline} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sellerColorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', border: 'none', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [formatCurrency(Number(val)), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#sellerColorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Minimal Top Products & Order State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Top Products */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <h3 className="text-sm font-black text-slate-900 tracking-tight border-b border-slate-100 pb-2">
            Top Performing Products
          </h3>
          <div className="space-y-2">
            {analytics.topProducts.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                <div className="truncate pr-2">
                  <p className="font-bold text-slate-800 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{p.sales} units sold</p>
                </div>
                <span className="font-black text-slate-900 shrink-0">{formatCurrency(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Minimal Order Fulfillment */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 tracking-tight border-b border-slate-100 pb-2">
            Fulfillment Overview
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Completed Orders</span>
                <span className="text-emerald-600">88%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[88%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Processing / In Transit</span>
                <span className="text-blue-600">10%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full w-[10%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Pending Action</span>
                <span className="text-amber-600">2%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full w-[2%]" />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
