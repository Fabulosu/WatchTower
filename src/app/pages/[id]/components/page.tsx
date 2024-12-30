import { Components } from "@/components/components";
import { authConfig } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/utils";
import axios from "axios";
import { getServerSession } from "next-auth";

export default async function ComponentsPage({ params }: { params: { id: number } }) {
    try {
        const session = await getServerSession(authConfig);
        if (session) {

            const config = {
                headers: { Authorization: `Bearer ${session.backendTokens.accessToken}` },
            };

            const response = await axios.get(BACKEND_URL + `/component/page/${params.id}`, config);
            const components: Component[] = response.data;
            return <Components components={components} />
        }
    } catch (error) {
        console.error("Error fetching page components:", error);
        return <Components components={[]} />
    }
}