"use client";

import {
    Sidebar,
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
import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Page = {
    value: string;
    label: string;
};

type AppSidebarProps = {
    pages: Page[];
    onChange: (selectedValue: string) => void;
    className?: string;
};

export function AppSidebar({ pages, onChange, className }: AppSidebarProps) {
    const [selectedPage, setSelectedPage] = useState<Page | null>(null);

    const handleSelect = (value: string) => {
        const selected = pages.find((page) => page.value === value) || null;
        setSelectedPage(selected);
        onChange(value);
    };

    return (
        <Sidebar className={className}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    {selectedPage ? selectedPage.label : "Select Page"}
                                    <ChevronDown className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                                {pages.map((page) => (
                                    <DropdownMenuItem
                                        key={page.value}
                                        onClick={() => handleSelect(page.value)}
                                    >
                                        {page.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
        </Sidebar>
    );
}