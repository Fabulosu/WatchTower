"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { Separator } from "./ui/separator";
import { motion } from "framer-motion";
import { FaCheckCircle, FaMinusCircle } from "react-icons/fa";
import { FaCircleExclamation, FaCircleXmark } from "react-icons/fa6";

type Component = {
    id: number;
    name: string;
    status: number;
    description: string;
};

type Components = {
    components?: Component[];
}

const componentStatusOptions = [
    { value: "1", icon: <FaCheckCircle className="text-green-500" size={16} />, label: "Operational" },
    { value: "2", icon: <FaMinusCircle className="text-yellow-500" size={16} />, label: "Degraded Performance" },
    { value: "3", icon: <FaCircleExclamation className="text-orange-500" size={16} />, label: "Partial Outage" },
    { value: "4", icon: <FaCircleXmark className="text-red-500" size={16} />, label: "Major Outage" },
];

const StatusIcon = ({ status }: { status: number }) => {
    const statusOption = componentStatusOptions.find(option => option.value === status.toString());
    return statusOption ? statusOption.icon : <span className="text-gray-500 text-lg">●</span>;
};

export function Components({ components }: Components) {
    return (
        <div className="w-screen mx-2 sm:w-[80vw] flex justify-center items-center">
            <div className="w-full sm:w-[45vw] mt-6 flex flex-col items-center">
                <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h1 className="text-2xl font-bold">Components</h1>
                    <Link
                        href="/components/create"
                        className={cn(buttonVariants({ variant: "default" }), "text-white font-semibold")}
                    >
                        Add component
                    </Link>
                </div>
                <Separator className="w-full h-[2px] my-4 bg-gray-300" />

                <div className="w-full grid gap-4 mt-4">
                    {components?.map((component) => (
                        <motion.div
                            key={component.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                            className="w-full bg-card rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <StatusIcon status={component.status} />
                                    <div>
                                        <h2 className="font-semibold text-lg text-muted-foreground">
                                            {component.name}
                                        </h2>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {component.description}
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href={`/components/edit/${component.id}`}
                                    className={cn(buttonVariants({ variant: "outline" }), "rounded-xl hover:bg-card-foreground/80")}
                                >
                                    Edit
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}