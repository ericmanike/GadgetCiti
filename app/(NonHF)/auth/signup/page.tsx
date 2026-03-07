

import AuthForm from '@/components/Login'

export const metadata = {
    title: "Sign Up - Letronix",
    description: "Create a new account",
};

function page() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <AuthForm mode="signup" />
        </div>
    )
}

export default page
