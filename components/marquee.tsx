"use client";

import Link from "next/link";
import { useState } from "react";


const Marquee = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null; // hide when closed

  return (
    <div className="block relative bg-gray-800 text-white    p-2 overflow-hidden border-b border-yellow-400 ">
      



      
      <div className="whitespace-nowrap animate-marquee m-auto text-center font-bold h-10 w-full cursor-pointer tracking-wider">
     
        Welcome to <span className="text-orange-500 font-bold">GADGETS CITi</span>, Your number one destination for quality electronic gadgets 🛍️🎉
        
      </div> 
    
        <style jsx>{`

        /* marquee */
        @keyframes marquee {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
.animate-marquee {
  display: inline-block;
  animation: marquee 30s linear infinite;
}

        
       

        `}</style>
    </div>
  );
};

export default Marquee;
