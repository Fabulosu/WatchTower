"use client";

import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { Separator } from "./ui/separator";
import { motion } from "framer-motion";
import { FaCheckCircle, FaEdit, FaMinusCircle } from "react-icons/fa";
import { FaCircleExclamation, FaCircleXmark } from "react-icons/fa6";
import { useEffect, useState, useTransition } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import axios from "axios";
import { BACKEND_URL } from "@/lib/data";
import { useSession } from "next-auth/react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { BsFillWrenchAdjustableCircleFill } from "react-icons/bs";
import { toast } from "react-hot-toast";

type Component = {
    id: number;
    name: string;
    status: number;
    description: string;
    order: number;
};

type ComponentsProps = {
    components?: Component[];
};

const componentStatusOptions = [
    { value: "1", icon: <FaCheckCircle className="text-green-500" size={16} />, label: "Operational" },
    { value: "2", icon: <FaMinusCircle className="text-yellow-500" size={16} />, label: "Degraded Performance" },
    { value: "3", icon: <FaCircleExclamation className="text-orange-500" size={16} />, label: "Partial Outage" },
    { value: "4", icon: <FaCircleXmark className="text-red-500" size={16} />, label: "Major Outage" },
    { value: "5", icon: <BsFillWrenchAdjustableCircleFill className="text-blue-500" size={16} />, label: "Under Maintenance" },
];

const StatusIcon = ({ status }: { status: number }) => {
    const statusOption = componentStatusOptions.find(option => option.value === status.toString());
    return statusOption ? statusOption.icon : <span className="text-gray-500 text-lg">●</span>;
};

export function Components({ components }: ComponentsProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [optimisticState, setOptimisticState] = useState<Component[]>([]);
    const [, startTransition] = useTransition();
    const [keyValue, setKeyValue] = useState(0);

    useEffect(() => {
        if (components) {
            setOptimisticState(components);
            setLoading(false);
        }
    }, [components]);

    const onDragEnd = async (result: any) => {
        if (!result.destination) return;

        const { source, destination } = result;

        if (source.index === destination.index) return;

        const newState = [...optimisticState];
        const [movedComponent] = newState.splice(source.index, 1);
        newState.splice(destination.index, 0, movedComponent);

        newState.forEach((component, index) => {
            component.order = index + 1;
        });

        setOptimisticState(newState);

        startTransition(async () => {
            const updatedOrders = newState.map(component => ({
                componentId: component.id,
                newOrder: component.order,
            }));

            setKeyValue(keyValue + 1);

            const config = {
                headers: { Authorization: `Bearer ${session?.backendTokens.accessToken}` },
            };

            try {
                await axios.put(`${BACKEND_URL}/component/order`, { components: updatedOrders }, config);
                toast.success("Component order updated successfully!");
            } catch (error) {
                toast.error("Failed to update component order.");
            }
        });
    };

    const handleDelete = async (id: number) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${session?.backendTokens.accessToken}` },
            };
            await axios.delete(BACKEND_URL + `/component/${id}`, config);
            setOptimisticState(prevState => prevState.filter(component => component.id !== id));
            toast.success("Component deleted successfully!");
        } catch (err) {
            toast.error("Error deleting component.");
            console.error('Error deleting component:', err);
        }
    };

    const handleEdit = (id: number) => {
        router.push(`components/edit/${id}`);
    };

    return (
        <div className="w-screen mx-2 sm:w-[80vw] flex justify-center items-center">
            <div className="w-full sm:w-[45vw] mt-6 flex flex-col items-center">
                <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h1 className="text-2xl font-bold">Components</h1>
                    <Link
                        href="components/create"
                        className={cn(buttonVariants({ variant: "default" }), "text-white font-semibold")}
                    >
                        Add component
                    </Link>
                </div>
                <Separator className="w-full h-[2px] my-4 bg-gray-300" />

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
                    </div>
                ) : optimisticState && optimisticState.length > 0 ? (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId={"components"}>
                            {(droppableProvided) => (
                                <ul
                                    ref={droppableProvided.innerRef}
                                    {...droppableProvided.droppableProps}
                                    className="w-full grid gap-4 mt-4"
                                >
                                    {optimisticState.sort((a, b) => a.order - b.order).map((component, index) => (
                                        <Draggable
                                            key={component.id}
                                            draggableId={component.id.toString()}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <li
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <motion.div
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

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger className="p-2 hover:bg-card/80 rounded-lg transition-colors">
                                                                    <MoreVertical className="h-5 w-5" />
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem asChild>
                                                                        <DropdownMenuItem onClick={() => handleEdit(component.id)}>
                                                                            <FaEdit className="mr-2 h-4 w-4" />
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuItem>
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <DropdownMenuItem className="text-red-500 focus:text-red-500" onSelect={(e) => e.preventDefault()}>
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                Delete
                                                                            </DropdownMenuItem>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                                <AlertDialogDescription>
                                                                                    This action cannot be undone. This will permanently delete the component and all its data.
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                <AlertDialogAction
                                                                                    onClick={async () => {
                                                                                        await handleDelete(component.id);
                                                                                        if (document.activeElement instanceof HTMLElement) {
                                                                                            document.activeElement.blur();
                                                                                        }
                                                                                        setTimeout(() => {
                                                                                            document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                                                                                        }, 0);
                                                                                    }}
                                                                                    className="bg-red-500 hover:bg-red-600"
                                                                                >
                                                                                    Delete
                                                                                </AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </motion.div>
                                                </li>
                                            )}
                                        </Draggable>
                                    ))}
                                    {droppableProvided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>
                ) : (
                    <div className="w-full flex justify-center items-center mt-4">
                        <p>No components to show</p>
                    </div>
                )}
            </div>
        </div>
    );
}