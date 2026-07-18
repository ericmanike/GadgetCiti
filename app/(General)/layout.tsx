import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Metadata } from 'next'
import { metadata } from '../layout'


export const pageMetadata: Metadata = {
  title: 'Gadget CITi - Your Trusted Plug for Quality Gadgets',
  description: 'Buy quality and trusted gadgets on Gadget CITi - your trusted platform for all phones, laptop and accessories - gadgets.',
  ...metadata,
}


export default function layout({ children }: { children: React.ReactNode }) {
 
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex flex-col min-h-[90vh] w-full">
        {children}
      </div>
      <Footer />
    </div>
  )
}
