
import React from 'react'
import AuthForm from '@/components/Login'

export const metadata = {
  title: "Login/SignUp - Letronix",
  description: "Authenticate to your account",
};

function page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AuthForm />
    </div>
  )
}

export default page