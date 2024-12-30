"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/lib/utils";
import Navbar from "@/components/navbar";
import toast from "react-hot-toast";

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
};

export default function CreatePage() {
    const router = useRouter();
    const { data: session } = useSession();

    const [pageName, setPageName] = useState("");
    const [companyWebsite, setCompanyWebsite] = useState("");
    const [supportURL, setSupportURL] = useState("");
    const [acceptTos, setAcceptTos] = useState(false);

    const handleCreatePage = async () => {
        if (!acceptTos) {
            return;
        }

        console.log(pageName, companyWebsite, supportURL);

        try {
            const response = await axios.post(BACKEND_URL + `/page`, {
                name: pageName,
                companyWebsite: companyWebsite ? companyWebsite : null,
                supportUrl: supportURL ? supportURL : null,
            }, {
                headers: {
                    Authorization: `Bearer ${session?.backendTokens.accessToken}`
                }
            });

            if (response.status === 201) {
                router.push(`/pages/${response.data.id}/components`);
                router.refresh();
                toast.success("Status page created successfully!");
            }
        } catch (error) {
            console.error("Error creating page:", error);
        }
    }

    return (
        <>
            <Navbar />
            <motion.div
                className="w-full pt-24 flex flex-col items-center"
                initial="initial"
                animate="animate"
                variants={fadeIn}
            >
                <motion.div
                    className="w-[45vw] space-y-2"
                    variants={fadeIn}
                >
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-background-foreground">
                            Configure Your Status Page
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Set up a professional status page to provide real-time updates on your service reliability
                        </p>
                    </div>

                    <Separator className="w-full h-[2px] bg-gray-300" />

                    <motion.div
                        className="space-y-6"
                        variants={fadeIn}
                    >
                        <div className="space-y-2">
                            <Label
                                htmlFor="pageName"
                                className="text-sm font-medium text-muted-foreground"
                            >
                                Status Page Name*
                            </Label>
                            <motion.div
                                whileTap={{ scale: 0.995 }}
                            >
                                <Textarea
                                    id="pageName"
                                    placeholder="Enter a descriptive name for your status page"
                                    value={pageName}
                                    onChange={(e) => setPageName(e.target.value)}
                                    className="border-gray-300"
                                />
                            </motion.div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="companyWebsite"
                                className="text-sm font-medium text-muted-foreground"
                            >
                                Company Website (optional)
                            </Label>
                            <motion.div
                                whileTap={{ scale: 0.995 }}
                            >
                                <Textarea
                                    id="companyWebsite"
                                    placeholder="https://your-company-website.com"
                                    value={companyWebsite}
                                    onChange={(e) => setCompanyWebsite(e.target.value)}
                                    className=" border-gray-300"
                                />
                            </motion.div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="supportURL"
                                className="text-sm font-medium text-muted-foreground"
                            >
                                Support Portal URL (optional)
                            </Label>
                            <motion.div
                                whileTap={{ scale: 0.995 }}
                            >
                                <Textarea
                                    id="supportURL"
                                    placeholder="https://support.your-company.com"
                                    value={supportURL}
                                    onChange={(e) => setSupportURL(e.target.value)}
                                    className=" border-gray-300"
                                />
                            </motion.div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="acceptTos"
                                className="text-sm font-medium text-gray-700"
                            >
                                Terms of Service Agreement
                            </Label>
                            <motion.div
                                className="flex items-center gap-3 p-3 rounded-md"
                            >
                                <Checkbox
                                    id="acceptTos"
                                    defaultChecked={acceptTos}
                                    onCheckedChange={() => setAcceptTos(!acceptTos)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 
                              focus:ring-blue-500 transition-colors duration-200"
                                />
                                <Label
                                    htmlFor="acceptTos"
                                    className="text-sm text-muted-foreground cursor-pointer"
                                >
                                    I agree to the Terms of Service and Privacy Policy
                                </Label>
                            </motion.div>
                        </div>
                    </motion.div>

                    <Separator className="h-[1px] bg-gray-300" />

                    <motion.div
                        className="flex justify-end pt-4"
                        variants={fadeIn}
                    >
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                onClick={handleCreatePage}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                            >
                                Initialize Status Page
                            </Button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </>
    );
}