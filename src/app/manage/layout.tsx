import { SidebarProvider } from "@/components/ui/sidebar"
import Navbar from "@/components/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            <div className="relative">
                <SidebarProvider>
                    <main className="mt-20">
                        {children}
                    </main>
                </SidebarProvider>
            </div>
        </>
    )
}