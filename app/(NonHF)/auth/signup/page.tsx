

import Signup from '@/components/Signup'

export const metadata = {
    title: "Sign Up - Gadget CITi",
    description: "Create a new account",
};

function page() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Signup />
        </div>
    )
}

export default page
