'use client';

import React, { useEffect, useState } from 'react';
import { 
  Search, Eye, Loader2, X, AlertCircle, ClipboardList, Clock, Truck, CheckCircle2, ChevronRight
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/toastProvider';
import { useAuth } from '@/components/AuthContext';

interface OrderItem {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
}

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setOrders([]);
    setLoading(false);
  }, []);

  // Update Status Handler
  const handleUpdateStatus = (orderId: string, newStatus: 'pending' | 'shipped' | 'delivered') => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, status: newStatus };
      }
      return ord;
    }));

    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }

    showToast(`Order status updated to ${newStatus.toUpperCase()}!`, 'success');
  };

  const filteredOrders = orders.filter(ord => {
    const matchesSearch = ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ord.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? ord.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-orange-500 w-10 h-10 mb-2" />
        <p className="text-slate-500 font-semibold">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Orders</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Track customer orders containing items from your store.</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-150 rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3.5 text-gray-400 size-4.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by order number, customer..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm font-semibold text-gray-900"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          {[
            { label: 'All', value: '' },
            { label: 'Pending', value: 'pending' },
            { label: 'Shipped', value: 'shipped' },
            { label: 'Delivered', value: 'delivered' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition select-none ${
                statusFilter === opt.value 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-150'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

      </div>

      {/* Orders Grid */}
      <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
            <ClipboardList size={52} className="mb-3 text-gray-300" />
            <p className="font-bold text-gray-655">No orders found</p>
            <p className="text-xs text-gray-400 max-w-xs mt-1">Incoming product orders placed by customers will be displayed here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-xs font-black text-gray-400 uppercase border-b border-gray-100">
                  <th className="pb-3 font-black">Order No.</th>
                  <th className="pb-3 font-black">Customer</th>
                  <th className="pb-3 font-black">Date</th>
                  <th className="pb-3 font-black">Total</th>
                  <th className="pb-3 font-black">Status</th>
                  <th className="pb-3 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(ord => (
                  <tr key={ord.id} className="group hover:bg-slate-50/50">
                    <td className="py-4 font-bold text-gray-900">{ord.orderNumber}</td>
                    <td className="py-4">
                      <div>
                        <p className="font-bold text-gray-900">{ord.customerName}</p>
                        <p className="text-xs text-gray-400 font-semibold">{ord.customerEmail}</p>
                      </div>
                    </td>
                    <td className="py-4 text-gray-600 font-semibold">{ord.date}</td>
                    <td className="py-4 text-gray-900 font-black">{formatCurrency(ord.total)}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                        ord.status === 'delivered' 
                          ? 'bg-green-50 text-green-700' 
                          : ord.status === 'shipped' 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'bg-amber-50 text-amber-705'
                      }`}>
                        {ord.status === 'delivered' && <CheckCircle2 size={12} />}
                        {ord.status === 'shipped' && <Truck size={12} />}
                        {ord.status === 'pending' && <Clock size={12} />}
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 bg-gray-50 text-gray-450 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                        >
                          <Eye size={14} /> Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer" onClick={() => setSelectedOrder(null)} />
          
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full z-10 overflow-hidden space-y-6 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedOrder(null)} 
              className="absolute right-4 top-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-orange-500 font-black tracking-widest uppercase">
                Order details
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">{selectedOrder.orderNumber}</h3>
              <p className="text-xs text-gray-400 font-semibold">{selectedOrder.date}</p>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <p className="text-xs font-black text-gray-550 uppercase tracking-wider border-b border-gray-100 pb-1">Order Items</p>
              {selectedOrder.items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <img src={item.imageUrl} alt={item.productName} className="w-12 h-12 object-cover rounded-xl border border-gray-100" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm max-w-[200px] truncate">{item.productName}</p>
                      <p className="text-xs text-gray-400 font-semibold">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-black text-gray-900 text-sm">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="font-black text-gray-400 uppercase tracking-wider">Ship To</p>
                <p className="font-bold text-gray-950">{selectedOrder.customerName}</p>
                <p className="text-gray-500 font-medium">{selectedOrder.shippingAddress}, {selectedOrder.city}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="font-black text-gray-400 uppercase tracking-wider">Contact</p>
                <p className="font-bold text-gray-950">{selectedOrder.customerPhone}</p>
                <p className="text-gray-500 font-medium">{selectedOrder.customerEmail}</p>
              </div>
            </div>

            {/* Status updates */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fulfillment status</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider w-fit flex items-center gap-1 ${
                  selectedOrder.status === 'delivered' ? 'bg-green-50 text-green-700' : selectedOrder.status === 'shipped' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {selectedOrder.status}
                </span>
              </div>
              
              <div className="flex gap-2">
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer flex items-center gap-1 shadow-md shadow-orange-500/10"
                  >
                    Mark as Shipped <ChevronRight size={14} />
                  </button>
                )}
                {selectedOrder.status === 'shipped' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer flex items-center gap-1 shadow-md shadow-green-500/10"
                  >
                    Mark as Delivered <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
