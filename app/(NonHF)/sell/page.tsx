'use client'
import Login from "@/components/Login";
import Card from "@/components/Card";
import ProductListingForm from "@/components/ProductListingForm";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Package, TrendingUp, DollarSign, PlusCircle, List, ArrowLeft } from 'lucide-react';

export default function SellPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'listings'>('upload');
  const router = useRouter();

  // Dummy stats for the layout
  const stats = [
    { label: 'Total Products', value: '124', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Sales', value: 'GHS 4,500', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Active Orders', value: '12', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium cursor-pointer mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your store, track sales, and upload new products.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
              <div className={`p-4 rounded-full ${stat.bg} mr-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-4 px-6 font-medium text-sm flex items-center transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'upload' 
                ? 'border-emerald-600 text-emerald-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Upload Product
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-4 px-6 font-medium text-sm flex items-center transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'listings' 
                ? 'border-emerald-600 text-emerald-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <List className="w-4 h-4 mr-2" />
            Your Listings
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          {activeTab === 'upload' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Upload New Product</h2>
                <p className="text-sm text-gray-500 mt-1">Fill out the details below to list a new item on your store.</p>
              </div>
              <ProductListingForm />
            </div>
          )}

          {activeTab === 'listings' && (
             <div className="flex flex-col items-center justify-center py-16 text-center">
               <Package className="w-16 h-16 text-gray-200 mb-4" />
               <h3 className="text-lg font-medium text-gray-900">No listings yet</h3>
               <p className="mt-2 text-sm text-gray-500 max-w-sm">You haven't uploaded any products to your store. Switch to the 'Upload Product' tab to get started.</p>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}
