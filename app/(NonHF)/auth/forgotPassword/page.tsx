 'use client'

 import React from 'react'
 import { Formik, Form, Field, ErrorMessage } from 'formik'
 import * as Yup from 'yup'
 import { useRouter } from 'next/navigation'
 import { useToast } from '@/components/toastProvider'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'


 
 export default function ForgotPasswordForm() {

   const { showToast } = useToast()
   
    const Router = useRouter()

    const [isSending, setIsSending] = useState(false);
  
   const resetPasswordValidationSchema = Yup.object().shape({
     email: Yup.string().email('Invalid email').required('Email is required'),
   })





     const resetPassword = async (values: { email: string }) => {
        
        setIsSending(true);
         try {   
         const res = await fetch('https://api.recyco.me/auth/request-reset', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ email: values.email }),
             credentials: 'include',
         })
         if (!res.ok) {
          console.log(' this is the email'+ values.email)
            throw new Error('Failed to request reset')
           
         }
         const data = await res.json()
        
         console.log('Reset email sent:', data)
         showToast('Check your email to reset your password', 'success')
         } catch (err: any) {
         showToast(err.message, 'error')
         console.error(err)
         } finally {
     
          setIsSending(false);
        }
     }
 
     return (      
     <div className='h-screen md:w-1/2 flex justify-center items-center m-auto '>

        <div className='w-[90%] m-auto flex justify-center items-center '>
        <button onClick={() => Router.replace('/Login')} className="absolute top-4 left-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded inline-flex items-center">
          <ArrowLeft/>
         <span>Back</span>
       </button>
         <Formik
           initialValues={{ email: '' }}
           validationSchema={resetPasswordValidationSchema}
           onSubmit={ resetPassword}

         >
           {({ isSubmitting, isValid, dirty }) => (
             <Form className="bg-white p-6 rounded shadow-md w-[80%]  h-[fit] flex flex-col gap-4">
               <h2 className="text-xl font-bold text-center">Enter your email to reset password</h2>
               <label>Email</label>
               <Field type="email" name="email" className="border p-2 rounded w-full" />
               <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
               <button
                 type="submit"
                 disabled={!dirty || !isValid || isSubmitting}
                 className={` ${ !dirty || !isValid ? 'bg-gray-600  cursor-not-allowed ' : 'bg-green-400 cursor-pointer'} text-white p-2 rounded transition-colors`}
               >
                 {isSending ? 'Sending...' : 'Send Reset Link'}
               </button>
             </Form>
           )}
         </Formik>
         </div>
     </div>
     )
 }
  
