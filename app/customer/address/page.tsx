'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/toastProvider';
import { supabase } from '@/lib/supabase';
import { 
  MapPin, Phone, Building, Compass, Info, Edit3, Save, X, Loader2, Sparkles, Check, CheckCircle2 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Eastern',
  'Central',
  'Northern',
  'Volta',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
  'Savannah',
  'North East',
  'Oti',
  'Western North'
];

export default function AddressBookPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // DB Fields state
  const [addressData, setAddressData] = useState({
    address: '',
    city: '',
    region: '',
    additionalInfo: '',
    additionalPhone: ''
  });

  // Backup state for cancelling edits
  const [originalData, setOriginalData] = useState({
    address: '',
    city: '',
    region: '',
    additionalInfo: '',
    additionalPhone: ''
  });

  // Fetch address from Supabase users table
  const fetchAddress = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('address, city, region, address_additional_info, additional_phone')
        .eq('id', userId)
        .single();

      if (error) {
        // If single() fails because no row matches, we can handle it
        if (error.code === 'PGRST116') {
          // No user row found yet, we will stay with empty defaults
          return;
        }
        throw error;
      }

      if (data) {
        const fetched = {
          address: data.address || '',
          city: data.city || '',
          region: data.region || '',
          additionalInfo: data.address_additional_info || '',
          additionalPhone: data.additional_phone || ''
        };
        setAddressData(fetched);
        setOriginalData(fetched);
      }
    } catch (err: any) {
      console.error('Error fetching address:', err);
      showToast(err.message || 'Failed to load address information.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchAddress(user.id);
      } else {
        // Not authenticated, redirect to login
        showToast('Please sign in to view your address book.', 'error');
        router.push('/login');
      }
    }
  }, [user, authLoading, fetchAddress, router, showToast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          address: addressData.address,
          city: addressData.city,
          region: addressData.region,
          address_additional_info: addressData.additionalInfo,
          additional_phone: addressData.additionalPhone
        })
        .eq('id', user.id);

      if (error) throw error;

      showToast('Address details saved successfully!', 'success');
      setOriginalData(addressData);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving address:', err);
      showToast(err.message || 'Failed to save address details.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setAddressData(originalData);
    setIsEditing(false);
  };

  // Check if any address info exists
  const hasSavedAddress = 
    originalData.address || 
    originalData.city || 
    originalData.region || 
    originalData.additionalInfo || 
    originalData.additionalPhone;

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="border-b border-gray-200 pb-5 animate-pulse">
          <div className="h-7 w-48 bg-slate-200 rounded-md"></div>
          <div className="h-4 w-72 bg-slate-100 rounded-md mt-2"></div>
        </div>

        {/* Card Skeleton */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xs space-y-6 animate-pulse">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div className="h-6 w-32 bg-slate-200 rounded-md"></div>
            <div className="h-8 w-16 bg-slate-200 rounded-md"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="h-4 w-20 bg-slate-100 rounded-md"></div>
              <div className="h-8 w-full bg-slate-100 rounded-md"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-20 bg-slate-100 rounded-md"></div>
              <div className="h-8 w-full bg-slate-100 rounded-md"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-20 bg-slate-100 rounded-md"></div>
              <div className="h-8 w-full bg-slate-100 rounded-md"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-20 bg-slate-100 rounded-md"></div>
              <div className="h-8 w-full bg-slate-100 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Address Book 
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-semibold">
            Manage your default shipping and delivery addresses for quick checkout.
          </p>
        </div>
        {!isEditing && hasSavedAddress && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Edit3 size={14} />
            Edit Address
          </button>
        )}
      </div>

      {/* Editing Mode Form */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              {hasSavedAddress ? 'Edit Delivery Address' : 'Set Up Delivery Address'}
            </h3>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Street Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Street Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={addressData.address}
                  onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
                  placeholder="e.g. 24 Spintex Road, near Shell Signboard"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* City / Town */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                City / Town <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={addressData.city}
                  onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                  placeholder="e.g. Accra"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Region Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Region <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Compass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  required
                  value={addressData.region}
                  onChange={(e) => setAddressData({ ...addressData, region: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Region</option>
                  {GHANA_REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
            </div>

            {/* Additional Phone Number */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Alternative Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={addressData.additionalPhone}
                  onChange={(e) => setAddressData({ ...addressData, additionalPhone: e.target.value })}
                  placeholder="Alternative contact e.g. +233 XX XXX XXXX"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Additional Address Information */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Additional Address Info (Landmarks / Instructions)
              </label>
              <div className="relative">
                <Info size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <textarea
                  value={addressData.additionalInfo}
                  onChange={(e) => setAddressData({ ...addressData, additionalInfo: e.target.value })}
                  placeholder="Provide landmark details (e.g. Next to the MTN office), gate code, or instruction for courier."
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Address
                </>
              )}
            </button>
          </div>
        </form>
      ) : !hasSavedAddress ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 border border-gray-200 shadow-xs text-center space-y-5">
          <div className="w-20 h-20 bg-orange-50 border border-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto ">
            <MapPin size={32} />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-black text-slate-950">No Address Saved Yet</h3>
            <p className="text-xs text-slate-500 font-medium">
              We don't have a default delivery address for your profile. Please add one to ensure smooth and speedy shipments!
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            
            Set Up Delivery Address
          </button>
        </div>
      ) : (
        /* Read-Only Display Card State */
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Default Shipping Address</span>
            </div>
            <span className="inline-flex items-center gap-1 bg-emerald-505/20 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/30">
              <CheckCircle2 size={12} /> Active
            </span>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Street Address */}
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 md:col-span-2">
                <div className="p-2 bg-orange-50 rounded-xl text-orange-600 shrink-0 mt-0.5 border border-orange-100">
                  <MapPin size={18} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Street Address</span>
                  <p className="text-base font-bold text-slate-900">{originalData.address}</p>
                </div>
              </div>

              {/* City */}
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="p-2 bg-orange-50 rounded-xl text-orange-600 shrink-0 mt-0.5 border border-orange-100">
                  <Building size={18} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">City / Town</span>
                  <p className="text-base font-bold text-slate-900">{originalData.city}</p>
                </div>
              </div>

              {/* Region */}
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="p-2 bg-orange-50 rounded-xl text-orange-600 shrink-0 mt-0.5 border border-orange-100">
                  <Compass size={18} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Region</span>
                  <p className="text-base font-bold text-slate-900">{originalData.region}</p>
                </div>
              </div>

              {/* Alt Contact Phone */}
              {originalData.additionalPhone && (
                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 md:col-span-2">
                  <div className="p-2 bg-orange-50 rounded-xl text-orange-600 shrink-0 mt-0.5 border border-orange-100">
                    <Phone size={18} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alternative Phone Number</span>
                    <p className="text-base font-bold text-slate-900">{originalData.additionalPhone}</p>
                  </div>
                </div>
              )}

              {/* Additional landmark/instructions */}
              {originalData.additionalInfo && (
                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 md:col-span-2">
                  <div className="p-2 bg-orange-50 rounded-xl text-orange-600 shrink-0 mt-0.5 border border-orange-100">
                    <Info size={18} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Additional Instructions & Landmarks</span>
                    <p className="text-sm font-semibold text-slate-700 leading-relaxed whitespace-pre-line">{originalData.additionalInfo}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
