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
import toast from "react-hot-toast";

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
};

export default function CreateComponent({ params }: { params: { id: number } }) {
    const router = useRouter();
    const { data: session } = useSession();

    const [componentName, setComponentName] = useState("");
    const [componentDescription, setComponentDescription] = useState("");
    const [displayUptime, setDisplayUptime] = useState(true);

    const handleCreateComponent = async () => {
        try {
            const response = await axios.post(BACKEND_URL + `/component/${params.id}`, {
                name: componentName,
                description: componentDescription,
                displayUptime: displayUptime,
                status: 1,
            }, {
                headers: {
                    Authorization: `Bearer ${session?.backendTokens.accessToken}`
                }
            });

            if (response.status === 201) {
                router.push(`/pages/${params.id}/components`);
                router.refresh();
                toast.success("Component created successfully!");
            }
        } catch (error) {
            console.error("Error creating component:", error);
        }
    }

    return (
        <motion.div
            className="w-full px-4 md:w-[80vw] mt-6 flex flex-col items-center"
            initial="initial"
            animate="animate"
            variants={fadeIn}
        >
            <motion.div
                className="w-full md:w-[90vw] lg:w-[45vw] space-y-2 max-w-2xl"
                variants={fadeIn}
            >
                <div className="space-y-2">
                    <h2 className="text-xl md:text-2xl font-semibold text-background-foreground">
                        Create new component
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Add a new component to monitor in your status page
                    </p>
                </div>

                <Separator className="w-full h-[2px] bg-gray-300" />

                <motion.div
                    className="space-y-6"
                    variants={fadeIn}
                >
                    <div className="space-y-2">
                        <Label
                            htmlFor="componentName"
                            className="text-sm font-medium text-muted-foreground"
                        >
                            Component name
                        </Label>
                        <motion.div
                            whileTap={{ scale: 0.995 }}
                        >
                            <Textarea
                                id="componentName"
                                placeholder="Enter component name..."
                                value={componentName}
                                onChange={(e) => setComponentName(e.target.value)}
                                className="w-full border-gray-300"
                            />
                        </motion.div>
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="componentDescription"
                            className="text-sm font-medium text-muted-foreground"
                        >
                            Description (optional)
                        </Label>
                        <motion.div
                            whileTap={{ scale: 0.995 }}
                        >
                            <Textarea
                                id="componentDescription"
                                placeholder="Describe your component..."
                                value={componentDescription}
                                onChange={(e) => setComponentDescription(e.target.value)}
                                className="w-full border-gray-300"
                            />
                        </motion.div>
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="displayUptime"
                            className="text-sm font-medium text-gray-700"
                        >
                            Display uptime
                        </Label>
                        <motion.div
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-md"
                        >
                            <Checkbox
                                id="displayUptime"
                                defaultChecked={displayUptime}
                                onCheckedChange={() => setDisplayUptime(!displayUptime)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 
                              focus:ring-blue-500 transition-colors duration-200 mt-1 sm:mt-0"
                            />
                            <Label
                                htmlFor="displayUptime"
                                className="text-sm text-muted-foreground cursor-pointer"
                            >
                                Display the historical status of this component on my status page
                            </Label>
                        </motion.div>
                    </div>
                </motion.div>

                <Separator className="h-[1px] bg-gray-300" />

                <motion.div
                    className="flex justify-end pt-4 w-full"
                    variants={fadeIn}
                >
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto"
                    >
                        <Button
                            onClick={handleCreateComponent}
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                        >
                            Create Component
                        </Button>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}