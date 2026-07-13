'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/toastProvider';
import { supabase } from '@/lib/supabase';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, ShieldCheck } from 'lucide-react';

export default function AccountPage() {
    const { user, loading } = useAuth();
    const { showToast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        location: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
                email: user.email || '',
                phone: user.user_metadata?.phone || user.phone || '',
                location: user.user_metadata?.location || 'Ghana'
            });
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const updatePayload: any = {
                data: {
                    full_name: formData.fullName,
                    phone: formData.phone,
                    location: formData.location
                }
            };

            if (formData.email && formData.email !== user?.email) {
                updatePayload.email = formData.email;
            }

            const { error } = await supabase.auth.updateUser(updatePayload);

            if (error) throw error;

            showToast('Account details updated successfully!', 'success');
            setIsEditing(false);
        } catch (err: any) {
            showToast(err.message || 'Failed to update account details', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-5">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Details</h1>
                    <p className="text-xs text-gray-500 mt-1 font-semibold">View and manage your personal user profile information.</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-2 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                        <Edit3 size={15} />
                        Edit 
                    </button>
                ) : (
                    <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 px-2 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                        <X size={15} />
                        Cancel
                    </button>
                )}
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200 flex flex-col md:flex-row items-center gap-6">
                <div className="w-12 h-12 md:w-20 md:h-20 bg-slate-800 text-white font-black text-base md:text-2xl rounded-xl md:rounded-2xl flex items-center justify-center shadow-md uppercase shrink-0">
                    {displayName.charAt(0)}
                </div>
                <div className="flex-1 text-center md:text-left space-y-1">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <h2 className="text-xl font-black text-slate-900">{displayName}</h2>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <ShieldCheck size={12} /> Verified Account
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold">{user?.email}</p>
                </div>
            </div>

            {/* User Details Grid / Form */}
            {isEditing ? (
                <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200 space-y-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-gray-100 pb-3">Update Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Full Name</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Phone Number</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+233 XX XXX XXXX"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Location / Address</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md disabled:opacity-50"
                        >
                            <Save size={14} />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <User size={16} className="text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</span>
                        </div>
                        <p className="text-base font-bold text-slate-900">{displayName}</p>
                    </div>

                    {/* Email */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Mail size={16} className="text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</span>
                        </div>
                        <p className="text-base font-bold text-slate-900">{user?.email}</p>
                    </div>

                    {/* Phone */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Phone size={16} className="text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone Number</span>
                        </div>
                        <p className="text-base font-bold text-slate-900">{user?.user_metadata?.phone || 'Not provided'}</p>
                    </div>

                    {/* Location */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <MapPin size={16} className="text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Country</span>
                        </div>
                        <p className="text-base font-bold text-slate-900">{user?.user_metadata?.location || 'Ghana'}</p>
                    </div>

                    {/* Member Since */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2 md:col-span-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Calendar size={16} className="text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Member Since</span>
                        </div>
                        <p className="text-base font-bold text-slate-900">{memberSince}</p>
                    </div>
                </div>
            )}
        </div>
    );
}