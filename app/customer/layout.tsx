import Navbar from "@/components/Navbar";
import CustomerSidebar from "@/components/CustomerSidebar";

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-300 relative">
            <Navbar />
            <div className="max-w-7xl mx-auto px-1 md:px-4 pt-36 md:pt-44 pb-8 grid grid-cols-[115px_1fr] md:grid-cols-[264px_1fr] gap-2 md:gap-6">
                <aside className="mt-2">
                    <CustomerSidebar />
                </aside>
                <main className="overflow-hidden relative">
                    {children}
                </main>
            </div>
        </div>
    );
}
