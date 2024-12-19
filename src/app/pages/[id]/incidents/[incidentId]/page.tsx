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

const severityOptions = [
    { value: "None", label: "None" },
    { value: "Minor", label: "Minor" },
    { value: "Major", label: "Major" },
    { value: "Critical", label: "Critical" },
];

const statusOptions = [
    { value: "0", label: "Investigating" },
    { value: "1", label: "Identified" },
    { value: "2", label: "Monitoring" },
    { value: "3", label: "Resolved" },
];

const componentStatusOptions = [
    { value: "1", label: "Operational" },
    { value: "2", label: "Degraded Performance" },
    { value: "3", label: "Partial Outage" },
    { value: "4", label: "Major Outage" },
];

export default function UpdateIncident({ params }: { params: { incidentId: number } }) {
    const incidentId = params.incidentId;
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
    }, [incidentId, session?.backendTokens.accessToken]);

    const fetchIncident = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${session?.backendTokens.accessToken}` },
            };
            const response = await axios.get(
                `http://localhost:8000/incident/${incidentId}`,
                config
            );
            console.log(response.data)
            setIncident(response.data);
            setSelectedSeverity(response.data.severity);
            setAffectedComponents(response.data.components);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching incident:", error);
        }
    };

    const handleUpdateIncident = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${session?.backendTokens.accessToken}` },
            };

            const updateData = {
                severity: selectedSeverity,
                status: selectedStatus,
                message: updateMessage,
                components: affectedComponents,
            };

            await axios.put(
                `http://localhost:8000/incident/${incidentId}`,
                updateData,
                config
            );

            fetchIncident();
            setUpdateMessage("");
        } catch (error) {
            console.error("Error updating incident:", error);
        }
    };

    const handleDeleteIncident = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${session?.backendTokens.accessToken}` },
            };
            await axios.delete(
                `http://localhost:8000/incident/${incidentId}`,
                config
            );
        } catch (error) {
            console.error("Error deleting incident:", error);
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
                <div className="flex items-center gap-4">
                    <p></p>
                    <Select
                        value={selectedSeverity}
                        onValueChange={setSelectedSeverity}
                    >
                        <SelectTrigger className="w-[200px]">
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
                    ))}
                </div>
            </div>

            <div className="w-[45vw] space-y-4">
                <h2 className="text-xl font-semibold">Add New Update</h2>
                <Separator className="w-full h-[2px] bg-gray-300 my-2" />
                <div className="space-y-4">
                    <Label htmlFor="iStatus">Incident Status</Label>
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
                    <Label htmlFor="updateMessage">Message</Label>
                    <Textarea
                        id="updateMessage"
                        placeholder="Update message..."
                        value={updateMessage}
                        onChange={(e) => setUpdateMessage(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
            </div>

            <div className="w-[45vw] space-y-4">
                <h2 className="text-xl font-semibold">Affected Components</h2>
                <Separator className="w-full h-[2px] bg-gray-300 my-2" />
                <div className="space-y-4">
                    {affectedComponents.map((component) => (
                        <div
                            key={component.id}
                            className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-card-foreground/10"
                        >
                            <span>{component.name}</span>
                            <Select
                                value={String(component.status)}
                                onValueChange={(value) =>
                                    updateComponentStatus(component.id, value)
                                }
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {componentStatusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
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
                            Delete Incident
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                incident and all its updates.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteIncident}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Button
                    onClick={handleUpdateIncident}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                    Update Incident
                </Button>
            </div>
        </div>
    );
}