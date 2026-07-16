'use client';

import React, { useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/toastProvider';
import { supabase } from '@/lib/supabase';
import { KeyRound, Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ChangePasswordPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setErrorMsg('All fields are required.');
            return;
        }

        if (newPassword.length < 6) {
            setErrorMsg('New password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMsg('New passwords do not match.');
            return;
        }

        if (newPassword === currentPassword) {
            setErrorMsg('New password must be different from current password.');
            return;
        }

        if (!user || !user.email) {
            setErrorMsg('User session not found. Please log in again.');
            return;
        }

        setLoading(true);

        try {
            // Step 1: Verify current password by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            });

            if (signInError) {
                setErrorMsg('Incorrect current password. Please try again.');
                setLoading(false);
                return;
            }

            // Step 2: Update password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) {
                setErrorMsg(updateError.message || 'Failed to update password. Please try again.');
            } else {
                setSuccessMsg('Your password has been successfully updated.');
                showToast?.('Password updated successfully!', 'success');
                // Clear state
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error: any) {
            setErrorMsg(error?.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xs border border-gray-100 max-w-2xl mx-auto min-h-[calc(100vh-12rem)] flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-6">
                <div className="space-y-2 text-center md:text-left">
                    <div className="inline-flex p-3 bg-orange-50 rounded-2xl text-orange-500 mb-2">
                        <KeyRound size={24} />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800">Change Password</h1>
                    <p className="text-sm text-slate-500">Update your account password to secure your account credentials.</p>
                </div>

                {errorMsg && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl font-semibold transition-all">
                        <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-red-500" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl font-semibold transition-all">
                        <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0 text-emerald-500" />
                        <span>{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Current Password */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Lock size={16} />
                            </div>
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-gray-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-medium transition focus:outline-none placeholder-slate-400"
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Lock size={16} />
                            </div>
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-gray-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-medium transition focus:outline-none placeholder-slate-400"
                                placeholder="Min. 6 characters"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Lock size={16} />
                            </div>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-gray-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-medium transition focus:outline-none placeholder-slate-400"
                                placeholder="Re-enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-98 shadow-sm flex justify-center items-center gap-2"
                    >
                        {loading ? (
                            <Spinner className="size-4" />
                        ) : (
                            'Update Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
