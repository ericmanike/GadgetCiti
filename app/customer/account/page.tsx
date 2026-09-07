'use client';

import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/toastProvider';
import { supabase } from '@/lib/supabase';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit3, Save, X,  BadgeCheck,
  CreditCard, Upload, CheckCircle2, Eye, Trash2, AlertCircle, Lock, Clock, ShieldCheck
} from 'lucide-react';

const accountSchema = Yup.object().shape({
  fullName: Yup.string().trim().min(2, 'Full name is too short').required('Full name is required'),
  email: Yup.string().trim().email('Please enter a valid email address').required('Email address is required'),
  phone: Yup.string()
    .trim()
    .transform((value) => (value === '' ? null : value))
    .matches(/^[0-9+\s()-]{8,20}$/, 'Please enter a valid phone number')
    .nullable(),
  location: Yup.string().trim().nullable(),
  ghanaCardNumber: Yup.string()
    .trim()
    .transform((value) => (value === '' ? null : value))
    .matches(/^(GHA-\d{9}-\d|[A-Za-z0-9-]{8,20})$/i, 'Invalid Ghana Card format (e.g. GHA-000000000-0)')
    .nullable(),
});

export default function AccountPage() {
    const { user, loading } = useAuth();
    const { showToast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savingCardNumber, setSavingCardNumber] = useState(false);

    // Ghana Card upload & verification status state
    const [ghanaCardFront, setGhanaCardFront] = useState<string | null>(null);
    const [ghanaCardBack, setGhanaCardBack] = useState<string | null>(null);
    const [uploadingCard, setUploadingCard] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<'unverified' | 'pending' | 'verified' | 'rejected'>('unverified');
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);

    const formik = useFormik({
        initialValues: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            ghanaCardNumber: ''
        },
        validationSchema: accountSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            setSaving(true);
            try {
                const updatePayload: any = {
                    data: {
                        full_name: values.fullName,
                        phone: values.phone,
                        location: values.location,
                        ghana_card_number: values.ghanaCardNumber
                    }
                };

                if (values.email && values.email !== user?.email) {
                    updatePayload.email = values.email;
                }

                const { error } = await supabase.auth.updateUser(updatePayload);

                if (error) throw error;

                // Sync with user_verifications table
                if (user) {
                    await supabase.from('user_verifications').upsert({
                        user_id: user.id,
                        ghana_card_number: values.ghanaCardNumber
                    }, { onConflict: 'user_id' });
                }

                showToast('Account details updated successfully!', 'success');
                setIsEditing(false);
            } catch (err: any) {
                showToast(err.message || 'Failed to update account details', 'error');
            } finally {
                setSaving(false);
            }
        }
    });

    // Load user verification status from Supabase user_verifications table
    const loadVerificationStatus = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('user_verifications')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) {
                console.error('Could not fetch from user_verifications table:', error);
                return;
            }

            if (data) {
                setVerificationStatus(data.status || 'pending');
                setRejectionReason(data.rejection_reason || null);
                if (data.ghana_card_front) setGhanaCardFront(data.ghana_card_front);
                if (data.ghana_card_back) setGhanaCardBack(data.ghana_card_back);
                if (data.ghana_card_number) {
                    formik.setFieldValue('ghanaCardNumber', data.ghana_card_number);
                }
            } else if (user.user_metadata?.ghana_card_status) {
                setVerificationStatus(user.user_metadata.ghana_card_status);
            }
        } catch (err) {
            console.error('Error querying user_verifications:', err);
        }
    };

    useEffect(() => {
        if (user) {
            formik.setValues({
                fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
                email: user.email || '',
                phone: user.user_metadata?.phone || user.phone || '',
                location: user.user_metadata?.location || 'Ghana',
                ghanaCardNumber: user.user_metadata?.ghana_card_number || ''
            });

            if (user.user_metadata?.ghana_card_front) {
                setGhanaCardFront(user.user_metadata.ghana_card_front);
            }
            if (user.user_metadata?.ghana_card_back) {
                setGhanaCardBack(user.user_metadata.ghana_card_back);
            }

            loadVerificationStatus();
        }
    }, [user]);

    // Quick save for Ghana Card Number
    const handleQuickSaveCardNumber = async () => {
        if (formik.errors.ghanaCardNumber) {
            showToast(formik.errors.ghanaCardNumber, 'error');
            return;
        }
        if (!formik.values.ghanaCardNumber) {
            showToast('Please enter your Ghana Card Number', 'error');
            return;
        }

        setSavingCardNumber(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    ghana_card_number: formik.values.ghanaCardNumber
                }
            });

            if (error) throw error;

            if (user) {
                await supabase.from('user_verifications').upsert({
                    user_id: user.id,
                    ghana_card_number: formik.values.ghanaCardNumber,
                    ghana_card_front: ghanaCardFront,
                    ghana_card_back: ghanaCardBack,
                    status: 'pending'
                }, { onConflict: 'user_id' });
            }

            showToast('Ghana Card Number saved to verification status table!', 'success');
        } catch (err: any) {
            showToast(err.message || 'Failed to save Ghana Card Number', 'error');
        } finally {
            setSavingCardNumber(false);
        }
    };

    // Handle image file selection for Ghana Card
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast('Image size must be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            if (side === 'front') {
                setGhanaCardFront(result);
            } else {
                setGhanaCardBack(result);
            }
            showToast(`Ghana Card ${side} image loaded! Remember to save documents.`, 'info');
        };
        reader.readAsDataURL(file);
    };

    // Save Ghana Card to user_verifications database table
    const handleSaveGhanaCard = async () => {
        setUploadingCard(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    ghana_card_front: ghanaCardFront,
                    ghana_card_back: ghanaCardBack,
                    ghana_card_status: 'pending',
                    ghana_card_updated_at: new Date().toISOString()
                }
            });

            if (error) throw error;

            if (user) {
                const { error: dbError } = await supabase.from('user_verifications').upsert({
                    user_id: user.id,
                    ghana_card_number: formik.values.ghanaCardNumber,
                    ghana_card_front: ghanaCardFront,
                    ghana_card_back: ghanaCardBack,
                    status: 'pending'
                }, { onConflict: 'user_id' });

                if (dbError) {
                    console.error('Error saving to user_verifications table:', dbError);
                } else {
                    setVerificationStatus('pending');
                }
            }

            showToast('Ghana Card documents saved to user_verifications table and submitted for review!', 'success');
        } catch (err: any) {
            console.error('Failed to save Ghana Card:', err);
            showToast(err.message || 'Failed to save Ghana Card documents.', 'error');
        } finally {
            setUploadingCard(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <div className="loader w-10 h-10" />
            </div>
        );
    }

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A';

    return (
        <div className="max-w-4xl mx-auto space-y-8 min-h-screen pb-16">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-5">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Details</h1>
                    <p className="text-xs text-gray-500 mt-1 font-semibold">View and manage your personal user profile information.</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                        <Edit3 size={15} />
                        Edit Profile
                    </button>
                ) : (
                    <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                        <X size={15} />
                        Cancel
                    </button>
                )}
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left space-y-1">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <h2 className="text-xl font-black text-slate-900">{displayName}</h2>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            < BadgeCheck size={12} /> Verified
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold">{user?.email}</p>
                </div>
                <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-600 text-white font-black text-sm md:text-lg rounded-xl md:rounded-2xl flex items-center justify-center shadow-md uppercase shrink-0">
                    {displayName.charAt(0)}
                </div>
            </div>

            {/* User Details Grid / Formik Form */}
            {isEditing ? (
                <form onSubmit={formik.handleSubmit} className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200 space-y-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-gray-100 pb-3">Update Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Full Name</label>
                            <input
                                type="text"
                                {...formik.getFieldProps('fullName')}
                                className={`w-full px-4 py-2.5 bg-slate-50 border ${formik.touched.fullName && formik.errors.fullName ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition`}
                            />
                            {formik.touched.fullName && formik.errors.fullName && (
                                <p className="mt-1 text-[11px] font-bold text-red-500">{formik.errors.fullName}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                {...formik.getFieldProps('email')}
                                className={`w-full px-4 py-2.5 bg-slate-50 border ${formik.touched.email && formik.errors.email ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition`}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <p className="mt-1 text-[11px] font-bold text-red-500">{formik.errors.email}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Phone Number</label>
                            <input
                                type="text"
                                {...formik.getFieldProps('phone')}
                                placeholder="+233 XX XXX XXXX"
                                className={`w-full px-4 py-2.5 bg-slate-50 border ${formik.touched.phone && formik.errors.phone ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition`}
                            />
                            {formik.touched.phone && formik.errors.phone && (
                                <p className="mt-1 text-[11px] font-bold text-red-500">{formik.errors.phone}</p>
                            )}
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Location / Address</label>
                            <input
                                type="text"
                                {...formik.getFieldProps('location')}
                                className={`w-full px-4 py-2.5 bg-slate-50 border ${formik.touched.location && formik.errors.location ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition`}
                            />
                            {formik.touched.location && formik.errors.location && (
                                <p className="mt-1 text-[11px] font-bold text-red-500">{formik.errors.location}</p>
                            )}
                        </div>

                        {/* Ghana Card Number */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Ghana Card Number</label>
                            <input
                                type="text"
                                {...formik.getFieldProps('ghanaCardNumber')}
                                placeholder="GHA-000000000-0"
                                className={`w-full px-4 py-2.5 bg-slate-50 border ${formik.touched.ghanaCardNumber && formik.errors.ghanaCardNumber ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1e293b] focus:ring-1 focus:ring-[#1e293b] focus:bg-white transition`}
                            />
                            {formik.touched.ghanaCardNumber && formik.errors.ghanaCardNumber && (
                                <p className="mt-1 text-[11px] font-bold text-red-500">{formik.errors.ghanaCardNumber}</p>
                            )}
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
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Calendar size={16} className="text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Member Since</span>
                        </div>
                        <p className="text-base font-bold text-slate-900">{memberSince}</p>
                    </div>

                    {/* Ghana Card Number Input */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-400">
                                <CreditCard size={16} className="text-orange-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ghana Card Number</span>
                            </div>
                            {user?.user_metadata?.ghana_card_number && (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    Saved
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col space-y-1 pt-0.5">
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    {...formik.getFieldProps('ghanaCardNumber')}
                                    placeholder="GHA-000000000-0"
                                    className={`w-full px-3.5 py-2 bg-slate-50 border ${formik.touched.ghanaCardNumber && formik.errors.ghanaCardNumber ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#1e293b] focus:bg-white transition`}
                                />
                                <button
                                    type="button"
                                    onClick={handleQuickSaveCardNumber}
                                    disabled={savingCardNumber}
                                    className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
                                >
                                    {savingCardNumber ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                            {formik.touched.ghanaCardNumber && formik.errors.ghanaCardNumber && (
                                <p className="text-[11px] font-bold text-red-500">{formik.errors.ghanaCardNumber}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Ghana Card Identification Section */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <CreditCard className="text-orange-500" size={20} />
                            <h3 className="text-base font-black text-slate-900 tracking-tight">Ghana Card Identity Verification</h3>
                        </div>
                        <p className="text-xs text-gray-500 font-semibold">
                            Upload clear images of your Ghana Card (Front & Back) for identity verification and secure transactions.
                        </p>
                    </div>
                    {verificationStatus === 'verified' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full shrink-0">
                            <CheckCircle2 size={14} /> Verified Account
                        </span>
                    )}
                    {verificationStatus === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full shrink-0 animate-pulse">
                            <Clock size={14} /> Verification Under Review
                        </span>
                    )}
                    {verificationStatus === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-full shrink-0">
                            <AlertCircle size={14} /> Verification Rejected
                        </span>
                    )}
                    {verificationStatus === 'unverified' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-full shrink-0">
                            <AlertCircle size={14} /> Unverified
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ghana Card Front */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Ghana Card - Front Side <span className="text-orange-500">*</span>
                        </label>
                        {ghanaCardFront ? (
                            <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-slate-50 group p-2">
                                <img src={ghanaCardFront} alt="Ghana Card Front" className="w-full h-48 object-cover rounded-xl shadow-xs" />
                                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewImage(ghanaCardFront)}
                                        className="p-2.5 bg-white/20 hover:bg-white/40 text-white rounded-xl backdrop-blur-xs transition cursor-pointer"
                                        title="Preview Front Image"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setGhanaCardFront(null)}
                                        className="p-2.5 bg-red-500/80 hover:bg-red-600 text-white rounded-xl transition cursor-pointer"
                                        title="Remove Front Image"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 hover:border-orange-500 rounded-2xl cursor-pointer bg-slate-50 hover:bg-orange-50/20 transition-all p-4 text-center group">
                                <Upload size={28} className="text-gray-400 group-hover:text-orange-500 transition-colors mb-2" />
                                <span className="text-xs font-bold text-slate-700 group-hover:text-orange-600">Upload Ghana Card Front</span>
                                <span className="text-[11px] text-gray-400 font-medium mt-1">PNG, JPG, WEBP up to 5MB</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e, 'front')}
                                />
                            </label>
                        )}
                    </div>

                    {/* Ghana Card Back */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Ghana Card - Back Side <span className="text-orange-500">*</span>
                        </label>
                        {ghanaCardBack ? (
                            <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-slate-50 group p-2">
                                <img src={ghanaCardBack} alt="Ghana Card Back" className="w-full h-48 object-cover rounded-xl shadow-xs" />
                                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewImage(ghanaCardBack)}
                                        className="p-2.5 bg-white/20 hover:bg-white/40 text-white rounded-xl backdrop-blur-xs transition cursor-pointer"
                                        title="Preview Back Image"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setGhanaCardBack(null)}
                                        className="p-2.5 bg-red-500/80 hover:bg-red-600 text-white rounded-xl transition cursor-pointer"
                                        title="Remove Back Image"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 hover:border-orange-500 rounded-2xl cursor-pointer bg-slate-50 hover:bg-orange-50/20 transition-all p-4 text-center group">
                                <Upload size={28} className="text-gray-400 group-hover:text-orange-500 transition-colors mb-2" />
                                <span className="text-xs font-bold text-slate-700 group-hover:text-orange-600">Upload Ghana Card Back</span>
                                <span className="text-[11px] text-gray-400 font-medium mt-1">PNG, JPG, WEBP up to 5MB</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e, 'back')}
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Save Ghana Card button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                        <Lock size={14} className="text-emerald-600" />
                        <span>Your Ghana Card documents are encrypted & safely stored.</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleSaveGhanaCard}
                        disabled={uploadingCard || (!ghanaCardFront && !ghanaCardBack)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CreditCard size={15} />
                        {uploadingCard ? 'Saving Documents...' : 'Save Ghana Card Documents'}
                    </button>
                </div>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="relative bg-white border border-gray-200 rounded-3xl max-w-2xl w-full p-4 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3 px-2">
                            <h4 className="text-sm font-extrabold text-slate-900">Ghana Card Preview</h4>
                            <button
                                type="button"
                                onClick={() => setPreviewImage(null)}
                                className="p-1.5 hover:bg-gray-100 text-slate-500 rounded-xl transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="overflow-hidden rounded-2xl bg-slate-900 flex items-center justify-center">
                            <img src={previewImage} alt="Ghana Card Large Preview" className="max-h-[70vh] w-auto object-contain rounded-xl" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}