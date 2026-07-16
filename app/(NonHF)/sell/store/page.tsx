'use client';

import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Store, Phone, Mail, MapPin, AlignLeft, ShieldCheck, Sparkles
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/toastProvider';

const validationSchema = Yup.object({
  storeName: Yup.string().required('Store name is required').min(3, 'Store name must be at least 3 characters'),
  storeDescription: Yup.string().required('Store description is required').min(10, 'Description must be at least 10 characters'),
  storePhone: Yup.string().required('Phone number is required'),
  storeEmail: Yup.string().email('Must be a valid email').required('Email is required'),
  storeAddress: Yup.string().required('Address is required'),
});

interface StoreFormValues {
  storeName: string;
  storeDescription: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
}

export default function StoreProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const formik = useFormik<StoreFormValues>({
    initialValues: {
      storeName: '',
      storeDescription: '',
      storePhone: '',
      storeEmail: '',
      storeAddress: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const { data, error } = await supabase.auth.updateUser({
          data: {
            store_name: values.storeName,
            store_description: values.storeDescription,
            store_phone: values.storePhone,
            store_email: values.storeEmail,
            store_address: values.storeAddress,
          }
        });

        if (error) throw error;
        showToast('Store profile updated successfully! 🎉', 'success');
      } catch (err: any) {
        console.error("Error updating store profile:", err);
        showToast(err.message || 'Failed to update store details.', 'error');
      } finally {
        setSaving(false);
      }
    }
  });

  useEffect(() => {
    if (user) {
      formik.setValues({
        storeName: user.user_metadata?.store_name || '',
        storeDescription: user.user_metadata?.store_description || '',
        storePhone: user.user_metadata?.store_phone || '',
        storeEmail: user.user_metadata?.store_email || user.email || '',
        storeAddress: user.user_metadata?.store_address || '',
      });
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="loader w-10 h-10 mb-2" />
        <p className="text-slate-500 font-semibold">Loading store settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl animate-fade-in pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Store Profile</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Configure your e-commerce storefront details visible to buyers.</p>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
        
        {/* Banner Decoration */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500" />
        
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          
          {/* Store Name */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Store size={14} className="text-orange-500" /> Store Name
            </label>
            <input
              name="storeName"
              type="text"
              value={formik.values.storeName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g. Gadget CITi Tech Hub"
              className="w-full px-4 py-3 rounded-xl border border-gray-250 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm font-semibold text-gray-900"
            />
            {formik.touched.storeName && formik.errors.storeName && (
              <p className="text-xs font-bold text-red-500">{formik.errors.storeName}</p>
            )}
          </div>

          {/* Store Description */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <AlignLeft size={14} className="text-orange-500" /> Store Description
            </label>
            <textarea
              name="storeDescription"
              rows={4}
              value={formik.values.storeDescription}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Describe your tech store, specialties, and support values..."
              className="w-full px-4 py-3 rounded-xl border border-gray-250 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm font-semibold text-gray-900"
            />
            {formik.touched.storeDescription && formik.errors.storeDescription && (
              <p className="text-xs font-bold text-red-500">{formik.errors.storeDescription}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Phone */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Phone size={14} className="text-orange-500" /> Store Phone Number
              </label>
              <input
                name="storePhone"
                type="text"
                value={formik.values.storePhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. +233 XX XXX XXXX"
                className="w-full px-4 py-3 rounded-xl border border-gray-250 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm font-semibold text-gray-900"
              />
              {formik.touched.storePhone && formik.errors.storePhone && (
                <p className="text-xs font-bold text-red-500">{formik.errors.storePhone}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Mail size={14} className="text-orange-500" /> Store Contact Email
              </label>
              <input
                name="storeEmail"
                type="email"
                value={formik.values.storeEmail}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="store@gadgetciti.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-250 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm font-semibold text-gray-900"
              />
              {formik.touched.storeEmail && formik.errors.storeEmail && (
                <p className="text-xs font-bold text-red-500">{formik.errors.storeEmail}</p>
              )}
            </div>

          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin size={14} className="text-orange-500" /> Physical Store Address
            </label>
            <input
              name="storeAddress"
              type="text"
              value={formik.values.storeAddress}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g. Ring Road Central, Accra"
              className="w-full px-4 py-3 rounded-xl border border-gray-250 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm font-semibold text-gray-900"
            />
            {formik.touched.storeAddress && formik.errors.storeAddress && (
              <p className="text-xs font-bold text-red-500">{formik.errors.storeAddress}</p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
              <ShieldCheck size={16} /> Saved changes are instantly synced
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition duration-200 shadow-lg shadow-orange-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {saving && <Spinner className="size-4" />}
              {saving ? 'Saving Profile...' : 'Save Store Profile'}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
