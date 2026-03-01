"use client"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "./Auth_Context"
import { useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,

  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DropdownProfile() {
  const router = useRouter();

  const { user, setUser, loading } = useAuth();

  useEffect(() => {

    console.log("DropdownProfile user:", user);
  }, [user]);


  const logout = async () => {
    try {
      const res = await fetch("https://api.recyco.me/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Logout failed");
      }
      setUser(null);
      router.push("/Login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className=" w-6 h-6 md:w-8 md:h-8 bg-orange-500 rounded-full 
       flex items-center justify-center
           text-white font-bold text-[9px] md:text-[12px] hover:bg-orange-600 transition cursor-pointer">
          {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="  bg-gray-50 text-black cursor-pointer">

        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer w-full hover:bg-orange-500 hover:text-white" onClick={() => router.push('/customer/account')}> Profile</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer w-full hover:bg-orange-500 hover:text-white" onClick={() => router.push('/subscription')}>Subscription</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-red-500" onClick={() => logout()}>Logout  <LogOut className="ml-2" /> </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}