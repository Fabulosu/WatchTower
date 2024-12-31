"use client";

import { useState, useEffect, useCallback } from "react";
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
import { BACKEND_URL, incidentStatusOptions, severityOptions } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { BsWrenchAdjustableCircleFill } from "react-icons/bs";
import LoadingSpinner from "@/components/ui/loading-spinner";

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

const componentStatusOptions = [
    { value: "1", icon: <FaCheckCircle className="text-green-500" size={16} />, label: "Operational" },
    { value: "2", icon: <FaMinusCircle className="text-yellow-500" size={16} />, label: "Degraded Performance" },
    { value: "3", icon: <FaCircleExclamation className="text-orange-500" size={16} />, label: "Partial Outage" },
    { value: "4", icon: <FaCircleXmark className="text-red-500" size={16} />, label: "Major Outage" },
    { value: "5", icon: <BsWrenchAdjustableCircleFill className="text-blue-500" size={16} />, label: "Under Maintenance" },
];

export default function UpdateIncident({ params }: { params: { id: number, incidentId: number } }) {
    const router = useRouter();
    const incidentId = params.incidentId;
    const { data: session } = useSession();
    const [incident, setIncident] = useState<Incident | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState("0");
    const [updateMessage, setUpdateMessage] = useState("");
    const [selectedSeverity, setSelectedSeverity] = useState("");
    const [affectedComponents, setAffectedComponents] = useState<Component[]>([]);

    const fetchIncident = useCallback(async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${session?.backendTokens.accessToken}` },
            };
            const response = await axios.get(
                BACKEND_URL + `/incident/${incidentId}`,
                config
            );

            if (response.data.scheduledAt != null) {
                router.replace(`/pages/${params.id}/incidents/edit-maintenance/${incidentId}`);
                throw new Error("Maintenance is not an incident");
            }

            setIncident(response.data);
            setSelectedSeverity(response.data.severity);
            setAffectedComponents(response.data.components);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching incident:", error);
        }
    }, [incidentId, params.id, router, session?.backendTokens.accessToken]);

    useEffect(() => {
        if (session?.backendTokens.accessToken) {
            fetchIncident();
        }
    }, [session?.backendTokens.accessToken, fetchIncident]);

    const handleUpdateIncident = async () => {
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
                BACKEND_URL + `/incident/status/${incidentId}`,
                updateData,
                config
            );

            fetchIncident();
            setUpdateMessage("");
            toast.success("Incident updated successfully");
        } catch (error) {
            console.error("Error updating incident:", error);
            toast.error("Failed to update incident");
        }
    };

    const handleDeleteIncident = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${session?.backendTokens.accessToken}` },
            };
            await axios.delete(
                BACKEND_URL + `/incident/${incidentId}`,
                config
            );
            toast.success("Incident deleted successfully");
            router.push(`/pages/${params.id}/incidents`);
        } catch (error) {
            console.error("Error deleting incident:", error);
            toast.error("Failed to delete incident");
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
            <LoadingSpinner />
        );
    }

    if (!incident) return null;

    return (
        <div className="w-full px-4 sm:px-6 md:w-[80vw] mt-4 sm:mt-6 flex flex-col items-center">
            <div className="w-full md:w-[90vw] lg:w-[45vw] flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 pb-6 sm:pb-10">
                <h1 className="text-xl sm:text-2xl font-bold">{incident.name}</h1>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="iSeverity" className="sm:mb-0">Severity</Label>
                    <Select
                        value={selectedSeverity}
                        onValueChange={setSelectedSeverity}
                    >
                        <SelectTrigger className="w-full sm:w-[200px]" id="iSeverity">
                            <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                            {severityOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="w-full md:w-[90vw] lg:w-[45vw] space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">Update History</h2>
                <Separator className="w-full h-[2px] bg-gray-300 my-2" />
                <div className="space-y-4">
                    {incident.history.map((update, index) => (
                        <div
                            key={index}
                            className="bg-card/50 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-card-foreground/10"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-2">
                                <span className="text-xs sm:text-sm font-medium">
                                    {incidentStatusOptions.find(s => s.value === String(update.status))?.label}
                                </span>
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                    {format(new Date(update.createdAt), "MMM d, yyyy HH:mm")}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">{update.statusMessage}</p>
                        </div>
                    )).reverse()}
                </div>
            </div>

            <div className="w-full md:w-[90vw] lg:w-[45vw] space-y-4 py-2">
                <h2 className="text-lg sm:text-xl font-semibold">Add New Update</h2>
                <Separator className="w-full h-[2px] bg-gray-300 my-2" />
                <div className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="iStatus" className="mb-2">Incident Status</Label>
                        <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]" id="iStatus">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {incidentStatusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="updateMessage" className="mb-2">Message</Label>
                        <Textarea
                            id="updateMessage"
                            placeholder="Update message..."
                            value={updateMessage}
                            onChange={(e) => setUpdateMessage(e.target.value)}
                            className="min-h-[50px] drop-shadow-lg w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="w-full md:w-[90vw] lg:w-[45vw] space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">Affected Components</h2>
                <Separator className="w-full h-[2px] bg-gray-300 my-2" />
                <div className="space-y-4">
                    {affectedComponents.map((component) => (
                        <div
                            key={component.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 gap-3 sm:gap-0 bg-card/50 backdrop-blur-sm rounded-lg border border-card-foreground/10 shadow-lg"
                        >
                            <span className="text-sm sm:text-base">{component.name}</span>
                            <Select
                                value={String(component.status)}
                                onValueChange={(value) =>
                                    updateComponentStatus(component.id, value)
                                }
                            >
                                <SelectTrigger className="w-full sm:w-[220px]">
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

            <div className="w-full md:w-[90vw] lg:w-[45vw] flex flex-col-reverse sm:flex-row justify-between gap-4 sm:gap-0 py-4">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full sm:w-auto">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Incident
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-[95%] sm:w-full mx-auto">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                incident and all its updates.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteIncident}
                                className="w-full sm:w-auto bg-red-500 hover:bg-red-600"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Button
                    onClick={handleUpdateIncident}
                    className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                    Update Incident
                </Button>
            </div>
        </div>
    );
}