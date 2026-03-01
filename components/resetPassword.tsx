'use client'
import { useState } from 'react'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useToast } from './toastProvider'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'



const newPasswordValidationSchema = Yup.object().shape({
  newPassword: Yup.string().min(6, 'Too short').required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
})

export default function ResetPasswordForm() {


  const Router = useRouter()
  const [isSending, setIsSending] = useState(false);
  const { showToast } = useToast()
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''






  const resetPassword = async (newPassword: string) => {
    setIsSending(true);
    if (!token || !email) {
      showToast('Invalid or missing token/email', 'error')
      setIsSending(false);
      return;
    }
    try {
      const res = await fetch('https://api.recyco.me/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token, email: email, new_password: newPassword }),
      })
      if (!res.ok) {
        console.log(' this is the token' + token)
        console.log(' this is the email' + email)
        console.log(' this is the new password' + newPassword)
        console.log('response', res)

        throw new Error('Password reset failed')
      }

      const data = await res.json()
      console.log('Password reset successful:', data)
      showToast('Password reset successful!', 'success')
      Router.replace('/Login')
    } catch (err: any) {
      showToast(err.message, 'error')
      console.error(err)
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="h-screen flex justify-center items-center bg-gray-300 p-10  md:w-1/2">


      <button onClick={() => Router.replace('/Login')} className="absolute top-4 left-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded inline-flex items-center">
        <ArrowLeft />
        <span>Back</span>
      </button>
      {(
        <Formik
          initialValues={{ newPassword: '', confirmPassword: '' }}
          validationSchema={newPasswordValidationSchema}
          onSubmit={(values) => resetPassword(values.newPassword)}
        >
          {({ isSubmitting, isValid, dirty }) => (
            <Form className="bg-white p-6 rounded shadow-md w-full  md:w-[80%]  h-[fit]    flex flex-col gap-4">
              <h2 className="text-xl font-bold text-center">Enter New Password</h2>
              <label>New Password</label>
              <div className="relative">
                <Field
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  className="border p-2 rounded w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <ErrorMessage name="newPassword" component="div" className="text-red-500 text-sm" />

              <label>Confirm Password</label>
              <div className="relative">
                <Field
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="border p-2 rounded w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm" />

              <button
                type="submit"
                disabled={!dirty || !isValid || isSubmitting}
                className={` ${!dirty || !isValid ? 'bg-gray-600 cursor-not-allowed ' : 'bg-green-400 cursor-pointer'} text-white p-2 rounded transition-colors`}
              >
                {isSending ? 'Reseting...' : 'Reset Password'}
              </button>
            </Form>
          )}
        </Formik>
      )}
    </div>
  )
}