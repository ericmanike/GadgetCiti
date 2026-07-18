'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, X, LayoutDashboard, ShoppingBag, Tag, Users, LogOut, ShieldAlert, KeyRound, Loader2, ClipboardList
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabase';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: Tag },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Orders', href: '/admin/orders', icon: ClipboardList },
  ];

  useEffect(() => {
    function checkAdminRole() {
      if (authLoading) return;

      if (!user) {
        setIsAdmin(false);
        setDbLoading(false);
        return;
      }

      const ADMIN_EMAILS = ['manikeeric@gmail.com'];
      const userEmail = user.email?.toLowerCase();

      if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setDbLoading(false);
    }

    checkAdminRole();
  }, [user, authLoading]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

  // Close mobile menu on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // 1. Loading State
  if (authLoading || dbLoading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center text-black">
        <div className="loader w-12 h-12 mb-4" />
        <p className="text-slate-400 font-semibold animate-pulse">Securing connection to SWAPPI ADMIN...</p>
      </div>
    );
  }

  // 2. Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto text-orange-500">
            <KeyRound size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Authentication</h1>
            <p className="text-slate-400 text-sm">
              Please sign in with an administrator account to access the control panel.
            </p>
          </div>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // 3. Logged in but not an Admin
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500 animate-bounce">
            <ShieldAlert size={40} />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-white tracking-tight">Access Denied</h1>
            <p className="text-slate-300 font-medium">
              You do not have the required permissions to view the administration panel.
            </p>
            <div className="bg-slate-950/65 border border-slate-850 p-4 rounded-xl text-left space-y-2 text-xs md:text-sm text-slate-400 font-mono">
              <p className="text-red-400 font-bold">Diagnostics Details:</p>
              <p>Connected User: {user.email}</p>
              <p>Role Assigned: <span className="text-orange-400 font-bold">Buyer/Seller</span> (requires <span className="text-emerald-400 font-bold">Admin</span>)</p>
              <p className="mt-2 text-slate-500 border-t border-slate-850 pt-2">
                To grant access, add this user's email to the `ADMIN_EMAILS` list in `app/(NonHF)/admin/layout.tsx`:
              </p>
              <span className="text-emerald-400 font-bold block">
                ADMIN_EMAILS = ['manikeeric@gmail.com', '{user.email}']
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition duration-200 cursor-pointer"
            >
              Sign Out
            </button>
            <button
              onClick={() => router.push('/buy')}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              Go to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Admin View
  return (
    <div className="min-h-screen bg-zinc-100 text-slate-950 flex flex-col md:flex-row font-sans">
      
      {/* Desktop Sidebar Sidebar - Always Visible on md+ */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 border-r border-slate-800 flex-col p-6 space-y-8 min-h-screen shadow-xl shrink-0">
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-800">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-lg tracking-wider shadow-lg shadow-orange-500/30">
            S
          </div>
         <span className='text-white'> 
          Admin Panel
         </span>
       
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </button>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold text-xs text-white">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-bold text-slate-200 truncate">{user.user_metadata?.full_name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 cursor-pointer border border-slate-800 hover:border-red-500/20"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header - Visible on <md */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black text-sm tracking-wider">
            G
          </div>
          <span className="font-black text-md text-white tracking-widest">CITi ADMIN</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="p-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-200 cursor-pointer"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-950/85 backdrop-blur-md z-40" 
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside 
            className="w-3/4 max-w-xs h-full bg-slate-900 border-r border-slate-800 flex flex-col p-6 space-y-6 shadow-2xl animate-in slide-in-from-left duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="font-black text-orange-500 tracking-wider">G CITi ADMIN</span>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-slate-400 hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'bg-orange-500 text-white shadow-lg' 
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                      }`}
                    >
                      <item.icon size={20} />
                      <span>{item.name}</span>
                    </button>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold text-xs text-white">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="truncate flex-1">
                  <p className="text-xs font-bold text-slate-200 truncate">{user.user_metadata?.full_name || 'Admin'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <button  
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2
                 bg-slate-800 hover:bg-red-500/10 hover:text-red-400
                  text-slate-400 font-semibold py-2 rounded-xl text-sm 
                  transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-full">
        {children}
      </main>
    </div>
  );
}
