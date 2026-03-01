import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import NavbarWrapper from '@/components/NavSuspense'
import { Metadata } from 'next'
import { metadata } from '../layout'


export const pageMetadata: Metadata = {
  title: 'Letronix - Your Trusted Plug for Quality Gadgets',
  description: 'Buy quality and trusted gadgets on Letronix - your trusted platform for all phones, laptop and accessories - gadgets.',
  ...metadata,
}


export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>

      <Navbar />
      {children}
      <Footer />
    </>
  )
}
