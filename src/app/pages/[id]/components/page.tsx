import { Components } from "@/components/components";
import { authConfig } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/data";
import axios from "axios";
import { getServerSession } from "next-auth";

type Component = {
    id: number;
    name: string;
    status: number;
    description: string;
};

export default async function ComponentsPage({ params }: { params: { id: number } }) {
    try {
        const session = await getServerSession(authConfig);
        if (session) {

            const config = {
                headers: { Authorization: `Bearer ${session.backendTokens.accessToken}` },
            };

            const response = await axios.get(BACKEND_URL + `/component/page/${params.id}`, config);
            const components: Component[] = response.data;
            console.log(components)
            return <Components components={components} />
        }
    } catch (error) {
        console.error("Error fetching page components:", error);
    }
}