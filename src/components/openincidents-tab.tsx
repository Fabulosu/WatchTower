"use client";

import { buttonVariants } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BACKEND_URL } from "@/lib/data";

const statusMap: { [key: string]: string } = {
    "0": "Investigating",
    "1": "Identified",
    "2": "Monitoring",
    "3": "Resolved",
};

const maintenanceStatusMap: { [key: string]: string } = {
    "0": "Scheduled",
    "1": "In progress",
    "2": "Verifying",
    "3": "Completed",
};

const getLatestStatus = (history: IncidentStatus[]) => {
    return history
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        ?.status.toString();
};

const StatusBadge = ({ status, type }: { status: string; type: number; }) => {
    const getStatusColor = () => {
        switch (status) {
            case "0":
                return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case "1":
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case "2":
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case "3":
                return 'bg-green-500/10 text-green-500 border-green-500/20';
        }
    };

    const getStatusText = () => {
        return type === 0 ? maintenanceStatusMap[status] : statusMap[status];
    };

    return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${type === 0 ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : getStatusColor()}`}>
            {getStatusText() || ""}
        </div>
    );
};

export function OpenIncidentsTab({ pageId }: { pageId: number }) {
    const { data: session } = useSession();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (pageId && session?.backendTokens.accessToken) {
            const fetchIncidents = async () => {
                try {
                    const config = {
                        headers: { Authorization: `Bearer ${session?.backendTokens.accessToken}` },
                    };

                    const response = await axios.get(BACKEND_URL + `/incident/page/${pageId}`, config);
                    const fetchedIncidents = response.data;
                    setIncidents(fetchedIncidents.filter((incident: Incident) => !incident.resolvedAt));
                } catch (err) {
                    setError('Failed to load incidents');
                    console.error('Error fetching incidents:', err);
                } finally {
                    setLoading(false);
                }
            };

            fetchIncidents();
        }
    }, [pageId, session?.backendTokens.accessToken]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (incidents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl bg-card/30 backdrop-blur-sm border border-card-foreground/10">
                <h3 className="text-2xl font-semibold mb-2">No open incidents</h3>
                <p className="text-muted-foreground text-center mb-6">
                    New incidents and scheduled maintenance events will appear here
                </p>
                <Link
                    href={"incidents/create"}
                    className={cn(buttonVariants({ variant: "default" }), "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white")}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Open Incident
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {incidents.map((incident) => (
                <motion.div
                    key={incident.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(`${incident.severity == "Minor" ? "border-t-4 border-t-yellow-600" : incident.severity == "Major" ? "border-t-4 border-t-orange-600" : incident.severity == "Critical" ? "border-t-4 border-t-red-600" : incident.severity == "Maintenance" ? "border-t-4 border-t-blue-600" : ""}`, "bg-card/50 backdrop-blur-sm rounded-lg p-6")}
                >
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">{incident.name}</h3>
                            <div className="flex items-center gap-2">
                                <StatusBadge
                                    status={getLatestStatus(incident.history)}
                                    type={incident.scheduledAt !== null ? 0 : 1}
                                />
                                <span className="text-sm text-muted-foreground">
                                    Last updated {format(new Date(incident.updatedAt), 'MMM d, yyyy HH:mm')}
                                </span>
                            </div>
                        </div>
                        <Link
                            href={incident.scheduledAt !== null ? `incidents/edit-maintenance/${incident.id}` : `incidents/edit/${incident.id}`}
                            className={cn(buttonVariants({ variant: "outline" }), "rounded-xl hover:bg-card-foreground/80")}
                        >
                            {incident.scheduledAt !== null ? "Update Maintenance" : "Update Incident"}
                        </Link>
                    </div>

                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                            Affected Components:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {incident.components.map((component) => (
                                <span
                                    key={component.id}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-card/60 border border-card-foreground/10"
                                >
                                    {component.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )).reverse()}
        </div>
    );
}