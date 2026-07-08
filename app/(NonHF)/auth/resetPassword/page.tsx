import { Metadata } from 'next'
import { metadata } from '../../../layout'


export const pageMetadata: Metadata = {         
  title: 'Reset Password - Gadget CITi',
  description: 'Reset your Gadget CITi account password securely and easily.',
  ...metadata, 
}





import ResetPasswordSuspense from '@/components/resetPasswordSuspense'
import { m } from 'framer-motion'

function page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <ResetPasswordSuspense />
  
    </div>
  )
}

export default page