"use client";

import Link from "next/link";
import { useState } from "react";
import TextType from "./ui/TextType";
import { ArrowUpRight,Cable, BanknoteArrowUp ,Phone } from "lucide-react";

const Marquee = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null; // hide when closed

  return (
    <div className="flex flex-row flex-nowrap  md:px-8  gap-3 sm:gap-5 justify-between  items-center bg-gray-800 text-white p-1 overflow-hidden border-b border-yellow-400 ">
   
    <div className="flex flex-nowrap items-center gap-2">
      <Cable className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />  
      <TextType 
        text={[
          "Shop The Best Gadgets Here",
          "Latest Tech, Smartphones & Accessories",
          "Unbeatable Quality & Prices"
        ]}
        typingSpeed={75}
        pauseDuration={1500}
        showCursor
        cursorCharacter="|"
        deletingSpeed={50}
        className="text-[10px] sm:text-sm md:text-lg font-semibold m-1"
        cursorBlinkDuration={0.5}
      />

</div>
   

      <div className="text-xs sm:text-sm md:text-md m-1">
        <Link href="/customer/pay-small-small" className="text-orange-500 hover:text-orange-400 flex items-center justify-center gap-2 hover:underline font-bold transition-colors whitespace-nowrap">
        <BanknoteArrowUp className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
          <span className="text-[10px] sm:text-sm md:text-base">Pay Small Small</span>
          <ArrowUpRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
        </Link>
      </div>
      
    </div>
  );
};

export default Marquee;
