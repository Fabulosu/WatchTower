"use client";

import { useState } from "react";
import { AppSidebar } from "./dashboard-sidebar";
import { DashboardContent } from "./dashboard-content";
import axios from "axios";
import { BACKEND_URL } from "@/lib/data";

type Page = {
    value: string;
    label: string;
};

type DashboardLayoutProps = {
    pages: Page[];
};

export function DashboardLayout({ pages }: DashboardLayoutProps) {
    const [selectedPage, setSelectedPage] = useState<Page | null>(null);
    const [pageData, setPageData] = useState<any>(null);

    const handleChange = async (selectedValue: string) => {
        const selected = pages.find((page) => page.value === selectedValue) || null;
        setSelectedPage(selected);

        if (selected) {
            try {
                const response = await axios.get(`${BACKEND_URL}/page/${selected.value}`);
                setPageData(response.data);
            } catch (error) {
                console.error("Error fetching page data:", error);
            }
        }
    };

    return (
        <div className="flex">
            <AppSidebar pages={pages} onChange={handleChange} className="mt-24" />
            <DashboardContent pageData={pageData} selectedPage={selectedPage} />
        </div>
    );
}
