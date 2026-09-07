import React from 'react'
import BuySuspense from '@/components/buySuspense'
import { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gadgetsciti.com'

export const metadata: Metadata = {
  title: 'Shop Quality Phones, Laptops & Accessories | Gadget CITi',
  description: 'Browse and buy quality iPhones, Android smartphones, laptops, audio gadgets, and electronic accessories at affordable prices on Gadget CITi.',
  alternates: {
    canonical: `${siteUrl}/buy`,
  },
  openGraph: {
    title: 'Shop Quality Phones, Laptops & Accessories | Gadget CITi',
    description: 'Browse and buy quality iPhones, Android smartphones, laptops, audio gadgets, and electronic accessories at affordable prices on Gadget CITi.',
    url: `${siteUrl}/buy`,
    siteName: 'Gadget CITi',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Quality Phones, Laptops & Accessories | Gadget CITi',
    description: 'Browse and buy quality iPhones, Android smartphones, laptops, audio gadgets, and electronic accessories at affordable prices on Gadget CITi.',
  },
}

function page() {
  return (
    <>
      <BuySuspense />
    </>
  )
}

export default page