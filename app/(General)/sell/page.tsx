'use client'
import Login from "@/components/Login";
import Card from "@/components/Card";
import WasteListingForm from "@/components/listingform";
import { useState } from "react";

export default function SellPage() {
  const [createListing, setCreateListing] = useState(true);







  return (
    <div className="min-h-screen font-sans 
     w-full   bg-gray-300  md:mt-10 flex flex-wrap justify-center  gap-2 ">

      <div className="my-20">

        <div className="w-full flex justify-center p-9 font-bold">

          <button className={`${createListing ? 'bg-orange-500  text-white ' : ' border border-black bg-transparent text-black'} 
   rounded-lg mr-5  p-3 font-bold cursor-pointer text-[10px]  md:text-[16px]`} onClick={() => setCreateListing(true)}>
            Create New Listing
          </button>


          <button className={`${createListing ? ' border border-black bg-transparent text-black' : 'bg-green-500  text-white '} 
     rounded-lg  p-3 font-bold cursor-pointer text-[10px]  md:text-[16px]`} onClick={() => setCreateListing(false)}>
            Your Listings
          </button>



        </div>

        {!createListing && (
          <div className=" flex flex-wrap justify-center gap-4 ">
            <Card discription='Plastic waste 1kg 200bags worth of 30 cedis 843985939728q7o9' image="/Wastocash.png" profile={{ name: 'Eric recycling', logo: '/Wastocash1.png' }} />
            <Card discription='Plastic waste 1kg 200bags worth of 30 cedis 843985939728q7o9' image="/Wastocash.png" profile={{ name: 'Eric recycling', logo: '/Wastocash1.png' }} />
            <Card discription='Plastic waste 1kg 200bags worth of 30 cedis 843985939728q7o9' image="/Wastocash.png" profile={{ name: 'Eric recycling', logo: '/Wastocash1.png' }} />
            <Card discription='Plastic waste 1kg 200bags worth of 30 cedis 843985939728q7o9' image="/Wastocash.png" profile={{ name: 'Eric recycling', logo: '/Wastocash1.png' }} />
            <Card discription='Plastic waste 1kg 200bags worth of 30 cedis 843985939728q7o9' image="/Wastocash.png" profile={{ name: 'Eric recycling', logo: '/Wastocash1.png' }} />
            <Card discription='Plastic waste 1kg 200bags worth of 30 cedis 843985939728q7o9' image="/Wastocash.png" profile={{ name: 'Eric recycling', logo: '/Wastocash1.png' }} />
          </div>)
        }


        {createListing && <WasteListingForm />}



        {!createListing && (
          <div className="my-20 h-20 flex justify-center items-center">
            <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
              previous
            </button>
            <span className="mx-4 text-gray-700 font-bold">Page 1 of 5</span>

            <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors ml-5">
              Next
            </button>

          </div>)
        }


      </div>








    </div>
  );
}
