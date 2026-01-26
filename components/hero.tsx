'use client'

import {  ShoppingCart, DollarSign, Truck } from 'lucide-react';
import Link from 'next/link';
import Carousel from '@/components/Carousel';
import RotatingText from '../components/RotatingText'
import CountUp from './CountUp'
import { useEffect, useRef } from "react";
import gsap from "gsap";
import SplitText from "gsap/SplitText";
gsap.registerPlugin(SplitText);
import SponsorLogoLoop from './logoLoop';
import {motion} from 'framer-motion'
import { Verified } from 'lucide-react';
import TestimonialCarousel from './testimonials';







//type  for react bits component

const RotatingTextType:any = RotatingText;
const CountUpType:any = CountUp;




export default function WasteManagementHero() {


 const textRef = useRef(null);
 const titleRef = useRef(null)

  useEffect(() => {
    // Run animation only after fonts are fully loaded
    document.fonts.ready.then(() => {
      if (!textRef.current) return;

      gsap.set(textRef.current, { opacity: 1 });

      const split = new SplitText(textRef.current, {
        type: "chars,words,lines",
        linesClass: "line",
        autoSplit: true,
        mask: "lines",
      });

      gsap.from(split.chars, {
         opacity: 0,
         y: 10,
        delay: 0.3,
        duration: 0.004,
        stagger: 0.004,
        ease: "none",
      });
    });
  }, []);



  useEffect(() => {
    // Run animation only after fonts are fully loaded
    document.fonts.ready.then(() => {
      if (!titleRef.current) return;

      gsap.set(titleRef.current, { opacity: 1 });

      const split = new SplitText(titleRef.current, {
        type: "chars,words,lines",
        linesClass: "line",
        autoSplit: true,
        mask: "lines",
      });

      gsap.from(split.lines, {
        duration: .5,
        delay: 0.2,
        y: 50,
        yPercent: 100,
        
        opacity: 0,
        stagger: 0.5,
        ease: "power4.out",
      });
    });
  }, []);












  return (
    <div className="min-h-screen  md:mt-25  bg-blue-50 flex flex-col items-center justify-center py-10 px-4">
      {/* Hero Section */}

      <div className="container mx-auto px-4 py-16 ">

        <div className='flex  justify-around'>

        <div className="text-center mb-12 ">
   
      <h1 ref={titleRef} className="text-2xl md:text-6xl font-bold text-gray-900 mb-4  md:p-2 " >
              Smart Waste Management
      </h1>
    
    
      <p className=" text-justify text-[12px]  md:text-2xl text-gray-700 mb-6 md:px-5 md:text-center" ref={textRef}> 
       <span className='font-bold text-green-600'> Recyco </span> 
       empowers you to turn everyday waste into cash 
        good habits and builds a sustainable future for everyone.
          </p>
         <div className='bg-green-400 md:w-[400px]
          flex justify-center text-center m-auto
           rounded-2xl  md:text-3xl text-white my-10 md:my-15 py-4 md:py-7
           shadow-lg  font-[merianda]
           relative
           '>
            <motion.p
            initial={{opacity:0, y:-10}}
            animate={{opacity:1, y:0}}
            transition={{duration:1, delay:1.5}}
            
            
            className='absolute -top-4 md:-top-3.5 left-[40%] text-[9px] md:text-[14px] bg-[#ffc400] text-black font-extrabold  rounded-[10px] py-2 px-2'>Our Mission</motion.p>
           <RotatingTextType
        texts={['Reduce Waste', 'Promote Recycling', 'Sustainable Living']}
        rotationInterval={5000}
        splitBy="words"
        staggerDuration={0.05}
      
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: '0%', opacity: 1 }}
        exit={{ x: '-100%', opacity: 0 }}
        className="te font-semibold "
      />
      </div>
        
        {/* Transforming waste into value through technology and community. */}
     
          <div className="mt-16  grid grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
          <div>
            <div className=" md:text-4xl font-bold text-green-600 mb-2">
             <CountUpType
        from={0}
        to={1000}
        separator=","
        direction="up"
        delay={1}
        duration={1}
        className="count-up-text"
      />+
          
              
              </div>
            <div className="text-gray-600 text-[10px] md:text-[16px]">Pickups Completed</div>
          </div>
          <div>
            <div className=" md:text-4xl font-bold text-green-600 mb-2">
      <CountUpType
        from={0}
        to={200}
        separator=","
        direction="up"
        duration={1}
        delay={1}
        className="count-up-text"
      />+

          </div> 
          <div className="text-gray-600 text-[10px] md:text-[16px]" >Active Sellers</div>
          </div>
          <div>
            <div className=" md:text-4xl font-bold text-green-600 mb-2">
               <CountUpType
        from={0}
        to={90}
        separator=","
        direction="up"
        duration={1}
        delay={1}
        className="count-up-text"
      />%
              
              </div>
            <div className="text-gray-600 text-[10px] md:text-[16px]">Recycling Rate</div>
          </div>
        </div>
      
        
        </div>
    {/* <div className='border-2 '> 

    

    </div> */}



        </div>
        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto my-10">
          {/* Order Pickup */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Order Pickup
            </h3>
            <p className="text-gray-600 mb-6">
              Schedule a convenient pickup time for your waste. We'll come to you.
            </p>
            <Link href={'/orderPickup'}>
              <motion.button 
              whileHover={{scale:0.95}}
              whileTap={{scale:1}}
              
              className="cursor-pointer w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Schedule Pickup
              </motion.button>
            </Link>
          </div>

          {/* Buy Waste */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
              <ShoppingCart className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Buy Recycled Materials
            </h3>
            <p className="text-gray-600 mb-6">
              Browse quality recycled materials for your business or projects.
            </p>
            <Link href={'/buy'}>
              <motion.button
               whileHover={{scale:0.95}}
              whileTap={{scale:1}}
              className="cursor-pointer w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Browse Materials
              </motion.button>
            </Link>
          </div>

          {/* Sell Waste */}
          <motion.div
         
          
          className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-200 transition-colors">
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Sell Your Waste
            </h3>
            <p className="text-gray-600 mb-6">
              Turn your recyclables into cash. Get paid for what you recycle.
            </p>
            <Link href={'/sell'}>
              <motion.button 
               whileHover={{scale:0.95}}
              whileTap={{scale:1}}
            
              className=" cursor-pointer w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                Start Selling
              </motion.button>
            </Link>
          </motion.div>
        </div>

        <hr className='my-10 h-8 text-gray-500'/>
        {/* Verified Section */}
      <div className="w-full flex justify-around flex-wrap my-30 bg-green-40 p-3  md:p-8 rounded-2xl shadow-lg">


  <motion.div className=' space-y-6 p-3'>
  <motion.div className='space-y-3 '>
    <h1 className='text-3xl md:text-6xl font-[cursive]'>Chat</h1>
    <p className='text-1xl md:text-2xl text-gray-700 max-w-3xl'>
      With  <span className='text-[gold] font-bold'> Verified</span> users, no scam, no excuses just real business
    </p>
    <p className='text-[9px] md:text-[16px]'>Make <span className=' font-bold'> money</span>  while keeping the evironment safe</p>
    <p className='text-[9px] md:text-[16px]'>♻️ Recycling made easy</p>
  </motion.div>
  
  <motion.div 
  whileInView={{scale:1.1, boxShadow:'0px 0px 8px rgb(34,197,94)'}}
  className='inline-flex items-center gap-2  px-4 py-2 text-white text-[16px] md:text-3xl font-bold bg-green-500 rounded-2xl'>
    Verified <Verified className='text-[gold]' />
  </motion.div>
</motion.div>

<Carousel />

        </div>


        {/* testimonial Section */}
         



     
    

    <div className="">
   <TestimonialCarousel/>
  


        </div>










     <div className="w-full flex flex-col my-10 gap-2 ">
        <p className='text-center font-bold text-2xl md:text-4xl'>Our Partners And sponsors </p> 
        <SponsorLogoLoop />

   </div>
        
      </div>


  <div className='w-full   py-10 '>
  <h3 className='text-center  font-bold'> Subscribe to our Daily updates</h3>
  <div  className='flex flex-wrap gap-2 mt-4 w-[80%] md:w-[60%] mx-auto '>
  <input placeholder="Enter your email"  className='p-2 w-full rounded  md:w-[80%] outline-2 outline-green-500'/>
  <motion.button
  whileFocus={{}}
  whileTap={{scale:1}}
  whileHover={{scale:0.95}}
   className=' bg-green-500 text-white cursor-pointer p-2 rounded w-[fit] md:w-[15%] '>Subscribe</motion.button>
  </div>
</div>



    </div>
  );
}