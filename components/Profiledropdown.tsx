"use client"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,

  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useAuth } from "./AuthContext"

export default function DropdownProfile() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) return  null;

  if (!user) {
    return (
      <button
        onClick={() => router.push('/auth/login')}
        className="px-4 py-2  md:py-2 bg-orange-500 text-white rounded-lg cursor-pointer text-[10px] md:text-sm font-bold hover:bg-orange-600 transition"
      >
        Sign In
      </button>
    );
  }

  const initial = user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
         
        <button className=" w-6 h-6 md:w-8 md:h-8 bg-blue-500 rounded-full 
       flex items-center justify-center
           text-white font-bold text-[9px] md:text-[12px] hover:bg-blue-600 transition cursor-pointer">
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="  bg-gray-50 text-black cursor-pointer">

        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer w-full hover:bg-orange-500 hover:text-white" onClick={() => router.push('/customer/account')}> Profile</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer w-full hover:bg-orange-500 hover:text-white" onClick={() => router.push('/subscription')}>Subscription</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-red-500" onClick={() => handleLogout()}>Logout  <LogOut className="ml-2" /> </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}