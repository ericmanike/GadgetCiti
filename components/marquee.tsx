"use client";

import Link from "next/link";
import { useState } from "react";
import {motion} from "framer-motion";

const Marquee = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null; // hide when closed

  return (
    <div className="block relative bg-gray-800 text-white    p-2 overflow-hidden border-b border-yellow-400 ">
      {/* Close button
      <motion.button
      whileHover={{ scale: 1.5, color:'red'}}
      whileTap={{scale:1}}

        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2  text-white  p-1  cursor-pointer  rounded-[100%]   z-50"
        aria-label="Close "
      >
        x
      </motion.button> */}

      {/* Marquee text */}
      <Link href="/gifts" >
      <div className="whitespace-nowrap animate-marquee m-auto text-center font-bold h-10 w-full cursor-pointer">
     
        Welcome to  Gadgets Citi ,Your number one Destination for all electronic gadgets 🛍️🎉
        
      </div> 
    </Link>
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
  animation: marquee 20s linear infinite;
}

        
       

        `}</style>
    </div>
  );
};

export default Marquee;
