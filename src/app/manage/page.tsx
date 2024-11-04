import { DashboardContent } from "@/components/dashboard-content";
import { authConfig } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/data";
import axios from "axios";
import { getServerSession } from "next-auth";

export default async function Dashboard() {
    const session = await getServerSession(authConfig);

    const config = {
        headers: { Authorization: `Bearer ${session?.backendTokens.accessToken}` }
    };

    const response = await axios.get(`${BACKEND_URL}/page/user/${session?.user.id}`, config);
    const pages = response.data.map((page: { id: string; name: string }) => ({
        value: page.id,
        label: page.name,
    }));

    return (
        <>
            <DashboardContent pages={pages} />
        </>
    );
}