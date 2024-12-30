"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { BACKEND_URL, getLatestStatus } from "@/lib/utils";

const statusMap: { [key: string]: string } = {
    "0": "Investigating",
    "1": "Identified",
    "2": "Monitoring",
    "3": "Resolved",
};

const StatusBadge = ({ status }: { status: string }) => {
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

    return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor()}`}>
            {statusMap[status] || ""}
        </div>
    );
};

const IncidentCard = ({ incident, onView, onDelete }: {
    incident: Incident;
    onView: (id: number) => void;
    onDelete: (id: number) => void;
}) => {
    const latestStatus = getLatestStatus(incident.history);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/50 backdrop-blur-sm border border-card-foreground/10 rounded-lg p-6 mb-4"
        >
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{incident.name}</h3>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-card/80 rounded-lg transition-colors">
                        <MoreVertical className="h-5 w-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(incident.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
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
                                        This action cannot be undone. This will permanently delete the
                                        incident and all its updates.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={async () => {
                                            await onDelete(incident.id);
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

            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                {!incident.resolvedAt && latestStatus && (
                    <StatusBadge status={latestStatus} />
                )}
                <span>
                    {incident.resolvedAt
                        ? `Resolved on ${format(new Date(incident.resolvedAt), 'MMM d, yyyy HH:mm')}`
                        : `Last updated ${format(new Date(incident.updatedAt), 'MMM d, yyyy HH:mm')}`}
                </span>
            </div>
        </motion.div>
    );
};

export function IncidentsTab({ pageId }: { pageId: number }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${session?.backendTokens.accessToken}` },
                };

                const response = await axios.get(BACKEND_URL + `/incident/page/${pageId}`, config);
                const fetchedIncidents = response.data;
                setIncidents(fetchedIncidents.filter((incident: Incident) => incident.scheduledAt === null));
            } catch (err) {
                setError('Failed to load incidents');
                console.error('Error fetching incidents:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchIncidents();
    }, [pageId, session?.backendTokens.accessToken]);

    const handleView = (id: number) => {
        router.push(`incidents/edit/${id}`);
    };

    const handleDelete = async (id: number) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${session?.backendTokens.accessToken}` },
            };
            await axios.delete(BACKEND_URL + `/incident/${id}`, config);
            setIncidents(incidents.filter(incident => incident.id !== id));
        } catch (err) {
            console.error('Error deleting incident:', err);
        }
    };

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
            <div className="text-center py-12">
                <p className="text-muted-foreground">No incidents found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {incidents.map((incident) => (
                <IncidentCard
                    key={incident.id}
                    incident={incident}
                    onView={handleView}
                    onDelete={handleDelete}
                />
            )).reverse()}
        </div>
    );
}