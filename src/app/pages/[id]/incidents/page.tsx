import { DashboardContent } from "@/components/dashboard-content";
import { BACKEND_URL } from "@/lib/utils";
import axios from "axios";

type Page = {
    name: string;
    id: number;
};

export default async function Page({ params }: { params: { id: number } }) {
    try {
        const response = await axios.get(`${BACKEND_URL}/page/${params.id}`);
        const pageData: Page = response.data;

        return <DashboardContent pageData={pageData} />;
    } catch (error) {
        console.error("Error fetching page data:", error);
        return <DashboardContent pageData={null} />;
    }
}