"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Navbar from "@/components/navbar";
import { AppSidebar } from "@/components/dashboard-sidebar";

export default function Layout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { id: string };
}) {
    return (
        <>
            <Navbar />
            <div className="relative">
                <SidebarProvider>
                    <AppSidebar className="mt-20" params={params} />
                    <main className="mt-20">
                        <SidebarTrigger className="sm:hidden" />
                        {children}
                    </main>
                </SidebarProvider>
            </div>
        </>
    );
}