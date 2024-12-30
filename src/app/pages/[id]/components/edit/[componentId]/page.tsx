"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/lib/data";
import { FaCheckCircle, FaMinusCircle } from "react-icons/fa";
import { FaCircleExclamation, FaCircleXmark } from "react-icons/fa6";
import { BsWrenchAdjustableCircleFill } from "react-icons/bs";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
};

const componentStatusOptions = [
    { value: "1", icon: <FaCheckCircle className="text-green-500" size={16} />, label: "Operational" },
    { value: "2", icon: <FaMinusCircle className="text-yellow-500" size={16} />, label: "Degraded Performance" },
    { value: "3", icon: <FaCircleExclamation className="text-orange-500" size={16} />, label: "Partial Outage" },
    { value: "4", icon: <FaCircleXmark className="text-red-500" size={16} />, label: "Major Outage" },
    { value: "5", icon: <BsWrenchAdjustableCircleFill className="text-blue-500" size={16} />, label: "Under Maintenance" },
];


export default function EditComponent({ params }: { params: { id: number, componentId: number } }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [componentName, setComponentName] = useState("");
    const [componentStatus, setComponentStatus] = useState("");
    const [componentDescription, setComponentDescription] = useState("");
    const [displayUptime, setDisplayUptime] = useState(true);

    useEffect(() => {
        if (session && params.componentId) {
            const fetchComponentData = async () => {
                try {
                    const response = await axios.get(BACKEND_URL + `/component/${params.componentId}`, {
                        headers: {
                            Authorization: `Bearer ${session?.backendTokens.accessToken}`
                        }
                    });

                    if (response.status === 200) {
                        setComponentName(response.data.name);
                        setComponentStatus(response.data.status);
                        setComponentDescription(response.data.description);
                    }
                } catch (error) {
                    console.error("Error fetching component data:", error);
                }
            }

            fetchComponentData();
        }
    }, [session, params.componentId])

    const handleUpdateComponent = async () => {
        try {
            const response = await axios.put(BACKEND_URL + `/component/update/${params.componentId}`, {
                name: componentName,
                description: componentDescription,
                displayUptime: displayUptime,
                status: parseInt(componentStatus),
            }, {
                headers: {
                    Authorization: `Bearer ${session?.backendTokens.accessToken}`
                }
            });

            if (response.status === 200) {
                toast.success("Component updated successfully!");
            }
        } catch (error) {
            console.error("Error creating component:", error);
        }
    }

    return (
        <motion.div
            className="w-[80vw] mt-6 flex flex-col items-center"
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
                                className=" border-gray-300"
                            />
                        </motion.div>
                    </div>

                    <div className="space-y-2">

                        <Label
                            htmlFor="componentStatus"
                            className="text-sm font-medium text-muted-foreground"
                        >
                            Component status

                        </Label>
                        <Select
                            value={String(componentStatus)}
                            onValueChange={(value) =>
                                setComponentStatus(value)
                            }
                        >
                            <SelectTrigger id="componentStatus" className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {componentStatusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <div className="flex flex-row items-center gap-2">
                                            {option.icon}
                                            <p>{option.label}</p>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                                className=" border-gray-300"
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
                            className="flex items-center gap-3 p-3 rounded-md"
                        >
                            <Checkbox
                                id="displayUptime"
                                defaultChecked={displayUptime}
                                onCheckedChange={() => setDisplayUptime(!displayUptime)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 
                              focus:ring-blue-500 transition-colors duration-200"
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
                    className="flex justify-end pt-4"
                    variants={fadeIn}
                >
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            onClick={handleUpdateComponent}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                        >
                            Update Component
                        </Button>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}