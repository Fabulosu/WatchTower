import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard-sidebar";
import Navbar from "@/components/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            <div className="relative">
                <SidebarProvider>
                    <AppSidebar className="mt-20" />
                    <main className="mt-20">
                        {children}
                    </main>
                </SidebarProvider>
            </div>
        </>
    )
}