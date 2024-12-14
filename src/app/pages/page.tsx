"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { BACKEND_URL } from "@/lib/data";
import { FaSpinner } from "react-icons/fa6";

export default function Pages() {
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        const fetchPagesAndRedirect = async () => {
            if (session?.user.id) {
                try {
                    const config = {
                        headers: {
                            Authorization: `Bearer ${session?.backendTokens.accessToken}`,
                        },
                    };

                    const response = await axios.get(
                        `${BACKEND_URL}/page/user/${session.user.id}`,
                        config
                    );

                    const pages = response.data || [];

                    if (pages.length > 0) {
                        const firstPageId = pages[0].id;
                        router.replace(`/pages/${firstPageId}`);
                    } else {
                        console.warn("No pages found for the user.");
                    }
                } catch (error) {
                    console.error("Error fetching user pages:", error);
                }
            }
        };

        fetchPagesAndRedirect();
    }, [session?.user.id]);

    return <FaSpinner />;
}