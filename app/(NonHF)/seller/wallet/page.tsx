'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, DollarSign, Clock, CheckCircle2, 
  AlertCircle, Building2, Smartphone, Plus, RefreshCw, ChevronRight, X, ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/toastProvider';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface Transaction {
  id: string;
  type: 'sale' | 'withdrawal' | 'payout_fee' | 'refund';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  reference_no?: string;
}

interface PayoutAccount {
  type: 'momo' | 'bank';
  networkOrBank: string;
  accountNumber: string;
  accountName: string;
}

export default function SellerWalletPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({
    available: 1850.00,
    pending: 420.00,
    totalWithdrawn: 3400.00,
    totalRevenue: 5670.00
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-001',
      type: 'sale',
      amount: 450.00,
      description: 'Order #ORD-8921 Payout (iPhone 13 Pro Silicone Case)',
      status: 'completed',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      reference_no: 'REF-8921-SALE'
    },
    {
      id: 'tx-002',
      type: 'withdrawal',
      amount: 1000.00,
      description: 'MoMo Payout to MTN (054****123)',
      status: 'completed',
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      reference_no: 'REF-MOMO-9912'
    },
    {
      id: 'tx-003',
      type: 'sale',
      amount: 1200.00,
      description: 'Order #ORD-8840 Payout (MacBook Air M2 13")',
      status: 'completed',
      created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
      reference_no: 'REF-8840-SALE'
    },
    {
      id: 'tx-004',
      type: 'sale',
      amount: 420.00,
      description: 'Order #ORD-8945 Payout (AirPods Pro Gen 2)',
      status: 'pending',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      reference_no: 'REF-8945-PEND'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'all' | 'sales' | 'withdrawals'>('all');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  // Payout Method State
  const [payoutAccount, setPayoutAccount] = useState<PayoutAccount>({
    type: 'momo',
    networkOrBank: 'MTN Mobile Money',
    accountNumber: '054 123 4567',
    accountName: 'Gadget CITi Store'
  });

  // Form states
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'momo' | 'bank'>('momo');
  const [momoNetwork, setMomoNetwork] = useState('MTN Mobile Money');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoName, setMomoName] = useState('');
  const [bankName, setBankName] = useState('GCB Bank');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

  useEffect(() => {
    if (!user) return;

    async function loadWalletData() {
      try {
        setLoading(true);
        // Fetch existing orders/sales if DB table is present
        const { data: ordersData } = await supabase
          .from('orders')
          .select('id, total_amount, status, created_at')
          .eq('seller_id', user!.id);

        if (ordersData && ordersData.length > 0) {
          const completedTotal = ordersData
            .filter(o => o.status === 'completed' || o.status === 'delivered')
            .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
          
          const pendingTotal = ordersData
            .filter(o => o.status === 'pending' || o.status === 'processing')
            .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

          setBalance(prev => ({
            ...prev,
            available: Math.max(completedTotal - prev.totalWithdrawn, 0),
            pending: pendingTotal,
            totalRevenue: completedTotal
          }));
        }
      } catch (err) {
        console.error("Wallet loading error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadWalletData();
  }, [user]);

  const handleRequestWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid withdrawal amount.', 'error');
      return;
    }

    if (amountNum > balance.available) {
      showToast(`Insufficient funds. Maximum available: ${formatCurrency(balance.available)}`, 'error');
      return;
    }

    setSubmittingWithdrawal(true);

    setTimeout(() => {
      const newTx: Transaction = {
        id: `tx-${Date.now().toString().slice(-4)}`,
        type: 'withdrawal',
        amount: amountNum,
        description: selectedMethod === 'momo' 
          ? `MoMo Payout request to ${momoNetwork} (${momoNumber || payoutAccount.accountNumber})`
          : `Bank Payout request to ${bankName} (${bankAccountNo})`,
        status: 'pending',
        created_at: new Date().toISOString(),
        reference_no: `REF-PAYOUT-${Math.floor(1000 + Math.random() * 9000)}`
      };

      setTransactions(prev => [newTx, ...prev]);
      setBalance(prev => ({
        ...prev,
        available: prev.available - amountNum,
        totalWithdrawn: prev.totalWithdrawn + amountNum
      }));

      setSubmittingWithdrawal(false);
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      showToast(`Payout request of ${formatCurrency(amountNum)} submitted successfully! 🚀`, 'success');
    }, 1200);
  };

  const handleSavePayoutAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMethod === 'momo') {
      if (!momoNumber || !momoName) {
        showToast('Please fill in your MoMo number and account name.', 'error');
        return;
      }
      setPayoutAccount({
        type: 'momo',
        networkOrBank: momoNetwork,
        accountNumber: momoNumber,
        accountName: momoName
      });
    } else {
      if (!bankAccountNo || !bankAccountName) {
        showToast('Please fill in your bank account details.', 'error');
        return;
      }
      setPayoutAccount({
        type: 'bank',
        networkOrBank: bankName,
        accountNumber: bankAccountNo,
        accountName: bankAccountName
      });
    }
    setIsAccountModalOpen(false);
    showToast('Payout account updated successfully! 💳', 'success');
  };

  const filteredTransactions = transactions.filter(t => {
    if (activeTab === 'sales') return t.type === 'sale';
    if (activeTab === 'withdrawals') return t.type === 'withdrawal';
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative bg-slate-900 text-white rounded-3xl p-6 md:p-10 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              <Wallet size={14} />
              Seller Revenue Wallet
            </div>
            <h1 className="text-xl md:text-3xl font-black tracking-tight text-white">
              Payouts & Earnings
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs md:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-orange-500/20 transition duration-200 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <ArrowUpRight size={18} />
              Request Payout
            </button>
          </div>
        </div>
      </div>

      {/* Balance Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Available Balance */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-150 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Available Balance</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight block">
              {formatCurrency(balance.available)}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              Ready for withdrawal
            </span>
          </div>
        </div>

        {/* Pending Escrow */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-150 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Pending Payouts</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight block">
              {formatCurrency(balance.pending)}
            </span>
            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-1">
              Awaiting order fulfillment
            </span>
          </div>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-150 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Withdrawn</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight block">
              {formatCurrency(balance.totalWithdrawn)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">
              Lifetime payouts transferred
            </span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-150 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Gross Sales</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight block">
              {formatCurrency(balance.totalRevenue)}
            </span>
            <span className="text-[10px] text-purple-600 font-bold block mt-1">
              All store orders combined
            </span>
          </div>
        </div>

      </div>

      {/* Payout Method Card & Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Payout Method */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                {payoutAccount.type === 'momo' ? <Smartphone size={20} /> : <Building2 size={20} />}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Default Payout Method</h3>
                <p className="text-[10px] text-gray-500 font-semibold">Where your requested funds are transferred</p>
              </div>
            </div>
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="text-xs font-bold text-orange-500 hover:text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              Change Account
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest block">
                {payoutAccount.networkOrBank}
              </span>
              <p className="text-sm font-extrabold text-slate-900">
                {payoutAccount.accountNumber}
              </p>
              <p className="text-xs text-gray-500 font-medium">
                Holder: <span className="font-bold text-slate-700">{payoutAccount.accountName}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                <CheckCircle2 size={12} /> Verified Method
              </span>
            </div>
          </div>
        </div>

        {/* Payout Security Note */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="inline-block bg-white/10 text-orange-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
              Fast Payout Processing
            </span>
            <h4 className="text-sm font-black">Same-Day Transfer Guaranteed</h4>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Mobile Money payouts are typically processed within 15 to 30 minutes. Bank transfers settle within 24 business hours.
            </p>
          </div>
          <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-400" /> Protected by Letronix Escrow Guarantee
          </div>
        </div>

      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900">Transaction History</h2>
            <p className="text-xs text-gray-500 font-medium">Recent sales deposits and withdrawal records</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'sales' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'withdrawals' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Withdrawals
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-black uppercase text-[10px] tracking-wider">
                <th className="pb-3">Transaction</th>
                <th className="pb-3">Reference</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'sale' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {tx.type === 'sale' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 max-w-[280px] md:max-w-md truncate">
                          {tx.description}
                        </p>
                        <span className="text-[10px] text-gray-400 uppercase font-bold">
                          {tx.type === 'sale' ? 'Order Deposit' : 'Payout Withdrawal'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-gray-500 font-mono text-[11px]">
                    {tx.reference_no}
                  </td>
                  <td className="py-4 text-gray-500 font-medium">
                    {new Date(tx.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      tx.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : tx.status === 'pending'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className={`py-4 text-right font-black text-sm ${
                    tx.type === 'sale' ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {tx.type === 'sale' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Payout Modal */}
      <AnimatePresence>
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWithdrawModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 z-10"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                    <ArrowUpRight size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Request Payout</h3>
                    <p className="text-xs text-gray-500 font-medium">Withdraw to MoMo or Bank</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRequestWithdrawal} className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Balance</span>
                  <p className="text-2xl font-black text-slate-900">{formatCurrency(balance.available)}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">
                    Withdrawal Amount (GHS) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={balance.available}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 500"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">
                    Destination Account
                  </label>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{payoutAccount.networkOrBank}</span>
                      <span className="text-[10px] text-gray-500 font-semibold">{payoutAccount.accountNumber} ({payoutAccount.accountName})</span>
                    </div>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase">
                      Default
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingWithdrawal || balance.available <= 0}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl text-sm transition shadow-lg shadow-orange-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {submittingWithdrawal ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Processing Payout...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight size={18} />
                      Confirm Payout Request
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Update Payout Account Modal */}
      <AnimatePresence>
        {isAccountModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAccountModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 z-10"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Payout Account Settings</h3>
                  <p className="text-xs text-gray-500 font-medium">Update your preferred receiving account</p>
                </div>
                <button
                  onClick={() => setIsAccountModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSavePayoutAccount} className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('momo')}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedMethod === 'momo' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    <Smartphone size={14} /> Mobile Money
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('bank')}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedMethod === 'bank' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    <Building2 size={14} /> Bank Account
                  </button>
                </div>

                {selectedMethod === 'momo' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">Network</label>
                      <select
                        value={momoNetwork}
                        onChange={(e) => setMomoNetwork(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm font-semibold text-slate-900 bg-white"
                      >
                        <option value="MTN Mobile Money">MTN Mobile Money</option>
                        <option value="Telecel Cash">Telecel Cash</option>
                        <option value="AT Money">AT Money</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">Mobile Number *</label>
                      <input
                        type="text"
                        placeholder="054 123 4567"
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm font-semibold text-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">Account Holder Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. John Doe / Gadget Store"
                        value={momoName}
                        onChange={(e) => setMomoName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm font-semibold text-slate-900"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">Bank Name</label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm font-semibold text-slate-900 bg-white"
                      >
                        <option value="GCB Bank">GCB Bank</option>
                        <option value="Ecobank Ghana">Ecobank Ghana</option>
                        <option value="Fidelity Bank">Fidelity Bank</option>
                        <option value="CalBank">CalBank</option>
                        <option value="Stanbic Bank">Stanbic Bank</option>
                        <option value="Absa Ghana">Absa Ghana</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">Account Number *</label>
                      <input
                        type="text"
                        placeholder="1441000123456"
                        value={bankAccountNo}
                        onChange={(e) => setBankAccountNo(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm font-semibold text-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">Account Holder Name *</label>
                      <input
                        type="text"
                        placeholder="Official Bank Account Name"
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm font-semibold text-slate-900"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl text-sm transition shadow-lg shadow-slate-900/10 cursor-pointer"
                >
                  Save Payout Account
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
