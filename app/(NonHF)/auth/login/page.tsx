import React from 'react'
import Login from '@/components/Login'

export const metadata = {
  title: "Login - Gadget CITi",
  description: "Authenticate to your account",
};

function page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Login />
    </div>
  )
}

export default page