"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Trash } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { FaCheckCircle, FaMinusCircle } from "react-icons/fa";
import { FaCircleExclamation, FaCircleXmark } from "react-icons/fa6";
import { BACKEND_URL } from "@/lib/utils";
import { BsWrenchAdjustableCircleFill } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface Incident {
    id: number;
    name: string;
    resolvedAt: string | null;
    severity: string;
    updatedAt: string;
    history: IncidentStatus[];
    components: Component[];
}

interface IncidentStatus {
    status: string;
    statusMessage: string;
    createdAt: string;
}

interface Component {
    id: number;
    name: string;
    status: string;
}

const statusOptions = [
    { value: "0", label: "Scheduled" },
    { value: "1", label: "In progress" },
    { value: "2", label: "Verifying" },
    { value: "3", label: "Completed" },
];

const componentStatusOptions = [
    { value: "1", icon: <FaCheckCircle className="text-green-500" size={16} />, label: "Operational" },
    { value: "2", icon: <FaMinusCircle className="text-yellow-500" size={16} />, label: "Degraded Performance" },
    { value: "3", icon: <FaCircleExclamation className="text-orange-500" size={16} />, label: "Partial Outage" },
    { value: "4", icon: <FaCircleXmark className="text-red-500" size={16} />, label: "Major Outage" },
    { value: "5", icon: <BsWrenchAdjustableCircleFill className="text-blue-500" size={16} />, label: "Under Maintenance" },
];

export default function UpdateMaintenance({ params }: { params: { id: number, maintenanceId: number } }) {
    const router = useRouter();
    const maintenanceId = params.maintenanceId;
    const { data: session } = useSession();
    const [incident, setIncident] = useState<Incident | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState("0");
    const [updateMessage, setUpdateMessage] = useState("");
    const [selectedSeverity, setSelectedSeverity] = useState("");
    const [affectedComponents, setAffectedComponents] = useState<Component[]>([]);

    useEffect(() => {
        if (session?.backendTokens.accessToken) {
            fetchIncident();
        }
    }, [maintenanceId, session?.backendTokens.accessToken]);

    const fetchIncident = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${session?.backendTokens.accessToken}` },
            };
            const response = await axios.get(
                BACKEND_URL + `/incident/${maintenanceId}`,
                config
            );
            if (response.data.scheduledAt === null) {
                router.replace(`/pages/${params.id}/incidents/edit/${maintenanceId}`);
                throw new Error("Incident is not a maintenance");
            }

            setIncident(response.data);
            setSelectedSeverity(response.data.severity);
            setAffectedComponents(response.data.components);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching incident:", error);
        }
    };

    const handleUpdateMaintenance = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${session?.backendTokens.accessToken}` },
            };

            const updateData = {
                severity: selectedSeverity,
                statusCode: parseInt(selectedStatus),
                updateMessage: updateMessage,
                components: affectedComponents.map(component => ({
                    id: component.id,
                    status: parseInt(component.status),
                })),
            };

            await axios.put(
                BACKEND_URL + `/incident/status/${maintenanceId}`,
                updateData,
                config
            );

            fetchIncident();
            setUpdateMessage("");
            toast.success("Maintenance updated successfully");
        } catch (error) {
            console.error("Error updating maintenance:", error);
            toast.error("Failed to update maintenance");
        }
    };

    const handleDeleteMaintenance = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${session?.backendTokens.accessToken}` },
            };
            await axios.delete(
                BACKEND_URL + `/incident/${maintenanceId}`,
                config
            );
            toast.success("Maintenance deleted successfully");
            router.replace(`/pages/${params.id}/incidents`);
        } catch (error) {
            console.error("Error deleting maintenance:", error);
            toast.error("Failed to delete maintenance");
        }
    };

    const updateComponentStatus = (componentId: number, newStatus: string) => {
        setAffectedComponents(components =>
            components.map(component =>
                component.id === componentId
                    ? { ...component, status: newStatus }
                    : component
            )
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
            </div>
        );
    }

    if (!incident) return null;

    return (
        <div className="w-[80vw] mt-6 flex flex-col items-center">
            <div className="w-[45vw] flex justify-between pb-10">
                <h1 className="text-2xl font-bold">{incident.name}</h1>
            </div>

            <div className="w-[45vw] space-y-4">
                <h2 className="text-xl font-semibold">Update History</h2>
                <Separator className="w-full h-[2px] bg-gray-300 my-2" />
                <div className="space-y-4">
                    {incident.history.map((update, index) => (
                        <div
                            key={index}
                            className="bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-card-foreground/10"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium">
                                    {statusOptions.find(s => s.value === String(update.status))?.label}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {format(new Date(update.createdAt), "MMM d, yyyy HH:mm")}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{update.statusMessage}</p>
                        </div>
                    )).reverse()}
                </div>
            </div>

            <div className="w-[45vw] space-y-4 py-2">
                <h2 className="text-xl font-semibold">Add New Update</h2>
                <Separator className="w-full h-[2px] bg-gray-300 my-2" />
                <div className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="iStatus">Maintenance Status</Label>
                        <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                        >
                            <SelectTrigger className="w-[200px]" id="iStatus">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="updateMessage" className="mt-2">Message</Label>
                        <Textarea
                            id="updateMessage"
                            placeholder="Update message..."
                            value={updateMessage}
                            onChange={(e) => setUpdateMessage(e.target.value)}
                            className="min-h-[50px] drop-shadow-lg"
                        />
                    </div>
                </div>
            </div>

            <div className="w-[45vw] space-y-4">
                <h2 className="text-xl font-semibold">Affected Components</h2>
                <Separator className="w-full h-[2px] bg-gray-300 my-2" />
                <div className="space-y-4">
                    {affectedComponents.map((component) => (
                        <div
                            key={component.id}
                            className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-card-foreground/10 shadow-lg"
                        >
                            <span>{component.name}</span>
                            <Select
                                value={String(component.status)}
                                onValueChange={(value) =>
                                    updateComponentStatus(component.id, value)
                                }
                            >
                                <SelectTrigger className="w-[220px]">
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
                    ))}
                </div>
            </div>

            <div className="w-[45vw] flex justify-between py-4">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Maintenance
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                maintenance and all its updates.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteMaintenance}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Button
                    onClick={handleUpdateMaintenance}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                    Update Maintenance
                </Button>
            </div>
        </div>
    );
}