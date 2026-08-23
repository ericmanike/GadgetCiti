"use client";

import Link from "next/link";
import { useState } from "react";
import TextType from "./ui/TextType";
import { ArrowUpRight,Cable, BanknoteArrowUp ,Phone } from "lucide-react";

const Marquee = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null; // hide when closed

  return (
    <div className="flex flex-row flex-nowrap px-3 sm:px-6 md:px-8 gap-3 sm:gap-5 justify-between items-center bg-gray-800 text-white py-2 sm:py-2.5 overflow-hidden border-b border-yellow-400">
      <div className="flex flex-nowrap items-center gap-2">
        <Cable className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 shrink-0" />  
        <TextType 
          text={[
            "Shop The Best Tech Here",
            "Latest Tech, Smartphones & Accessories",
            "Unbeatable Quality & Prices"
          ]}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor
          cursorCharacter="|"
          deletingSpeed={50}
          className="text-xs sm:text-sm md:text-base font-semibold"
          cursorBlinkDuration={0.5}
        />
      </div>

      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        <a
          href="tel:0543442518"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-yellow-400 hover:text-yellow-300 transition-colors whitespace-nowrap"
        >
          <Phone className="w-4 h-4 text-yellow-400 shrink-0" />
          <span className="hidden xs:inline sm:inline">054 344 2518</span>
        </a>

        <Link href="/customer/pay-small-small" className="text-orange-500 hover:text-orange-400 flex items-center justify-center gap-1.5 hover:underline font-bold transition-colors whitespace-nowrap text-xs sm:text-sm">
          <BanknoteArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
          <span>Pay Small Small</span>
          <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Link>
      </div>
    </div>
  );
};

export default Marquee;
