"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, AlertCircle, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { BACKEND_URL } from "@/lib/data";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FaExternalLinkAlt, FaPlus } from "react-icons/fa";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { Separator } from "./ui/separator";

type Page = {
    value: string;
    label: string;
};

type AppSidebarProps = {
    className?: string;
    params: { id: string };
};

const NavLink = ({ href, className, children, target }: {
    href: string;
    className?: string;
    children: React.ReactNode;
    target?: string;
}) => {
    const pathname = usePathname();
    const isActive = pathname.includes(href);

    return (
        <Link
            href={href}
            target={target}
            className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                "hover:bg-card/80",
                isActive
                    ? "text-green-500 bg-green-500/10"
                    : "text-muted-foreground hover:text-foreground",
                className
            )}
        >
            {children}
        </Link>
    );
};

export function AppSidebar({ className, params }: AppSidebarProps) {
    const router = useRouter();
    const { data: session } = useSession();

    const [selectedPage, setSelectedPage] = useState<Page | null>(null);
    const [pages, setPages] = useState<Page[] | null>(null);

    const config = {
        headers: { Authorization: `Bearer ${session?.backendTokens.accessToken}` },
    };

    useEffect(() => {
        if (session?.user.id) {
            const getUserPages = async () => {
                try {
                    const response = await axios.get(`${BACKEND_URL}/page/user/${session?.user.id}`, config);
                    const fetchedPages: Page[] =
                        response.data?.map((page: { id: string; name: string }) => ({
                            value: page.id,
                            label: page.name,
                        })) || [];


                    setPages(fetchedPages);

                    const selected = fetchedPages.find((page: Page) => page.value == params.id) || null;
                    setSelectedPage(selected);
                } catch (error) {
                    console.error("Error fetching pages:", error);
                }
            };

            getUserPages();
        }
    }, [session?.user.id, params.id]);

    const handleSelect = (value: string) => {
        const selected = pages?.find((page) => page.value === value) || null;
        setSelectedPage(selected);
        router.replace(`/pages/${selected?.value}/incidents`);
    };

    return (
        <Sidebar className={className}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="w-full text-left">
                                    {selectedPage ? selectedPage.label : "Select Page"}
                                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                                {pages?.map((page) => (
                                    <DropdownMenuItem
                                        key={page.value}
                                        onClick={() => handleSelect(page.value)}
                                    >
                                        {page.label}
                                    </DropdownMenuItem>
                                ))}
                                <Separator className="w-full h-[2px] my-1 bg-gray-300" />
                                <DropdownMenuItem
                                    onClick={() => router.push("/pages/create")}
                                    className="flex w-full h-12 items-center"
                                >
                                    <FaPlus className="text-muted-foreground" />
                                    <p>Add another page</p>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="space-y-1 px-2">
                    <SidebarGroupLabel className="font-bold">Manage your page</SidebarGroupLabel>
                    {selectedPage && (
                        <>
                            <NavLink href={`/pages/${selectedPage.value}/incidents`}>
                                <AlertCircle className="h-4 w-4" />
                                Incidents
                            </NavLink>
                            <NavLink href={`/pages/${selectedPage.value}/components`}>
                                <Layers className="h-4 w-4" />
                                Components
                            </NavLink>
                        </>
                    )}
                    {!selectedPage && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            Select a page to view options
                        </div>
                    )}
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel className="font-bold">Shortcuts</SidebarGroupLabel>
                    {selectedPage && (
                        <>
                            <NavLink href={`/page/${selectedPage.value}`} target="_blank">
                                View status page
                                <FaExternalLinkAlt className="h-4 w-4" />
                            </NavLink>
                        </>
                    )}
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}