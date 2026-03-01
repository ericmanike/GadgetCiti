'use client'
import * as React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,

  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
export default function DropdownMenuRadioGroupDemo() {
  const [position, setPosition] = React.useState("right")
  return (
    <DropdownMenu >
      <DropdownMenuTrigger asChild>
        <ChevronDown size={20} className="cursor-pointer hover:text-[#2fff00b9]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40 flex  justify-around h-fit py-3 bg-gray-50 text-black cursor-pointer">

        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <Link href="/news"> <DropdownMenuRadioItem value="top" className="cursor-pointer w-full hover:bg-green-500"> News</DropdownMenuRadioItem></Link>
          <Link href="/support">  <DropdownMenuRadioItem value="right" className="cursor-pointer w-full hover:bg-green-500">Support our work</DropdownMenuRadioItem></Link>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
