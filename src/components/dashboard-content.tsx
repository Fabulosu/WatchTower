"use client";

import { Combobox } from "@/components/ui/combobox";
import { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/lib/data";

type Page = {
    value: string;
    label: string;
};

type DashboardContentProps = {
    pages: Page[];
};

export function DashboardContent({ pages }: DashboardContentProps) {
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
            <div className="w-1/3">
                <Combobox items={pages} onChange={handleChange} />
                {selectedPage && (
                    <div className="mt-4">
                        <h2>Selected Page: {selectedPage.label}</h2>
                    </div>
                )}
            </div>

            <div className="w-2/3 ml-8">
                {pageData ? (
                    <div>
                        <h3>Page Data</h3>
                        <pre>{JSON.stringify(pageData, null, 2)}</pre>
                    </div>
                ) : (
                    <p>Select a page to view details.</p>
                )}
            </div>
        </div>
    );
}