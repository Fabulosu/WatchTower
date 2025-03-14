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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FaCheckCircle, FaMinusCircle } from "react-icons/fa";
import { FaCircleExclamation, FaCircleXmark } from "react-icons/fa6";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { BACKEND_URL, incidentStatusOptions, severityOptions } from "@/lib/utils";
import toast from "react-hot-toast";

interface Component {
    id: number;
    name: string;
    status: number;
}

const componentStatusOptions = [
    { value: "1", icon: <FaCheckCircle className="text-green-500" size={16} />, label: "Operational" },
    { value: "2", icon: <FaMinusCircle className="text-yellow-500" size={16} />, label: "Degraded Performance" },
    { value: "3", icon: <FaCircleExclamation className="text-orange-500" size={16} />, label: "Partial Outage" },
    { value: "4", icon: <FaCircleXmark className="text-red-500" size={16} />, label: "Major Outage" },
];

export default function CreateIncident({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [incidentName, setIncidentName] = useState("");
    const [selectedSeverity, setSelectedSeverity] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("0");
    const [updateMessage, setUpdateMessage] = useState("");
    const [components, setComponents] = useState<Component[]>([]);
    const [selectedComponents, setSelectedComponents] = useState<Component[]>([]);
    const [formErrors, setFormErrors] = useState({
        incidentName: '',
        severity: '',
        selectedComponents: ''
    });

    useEffect(() => {
        const fetchComponents = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${session?.backendTokens.accessToken}` },
                };
                const response = await axios.get(BACKEND_URL + `/component/page/${params.id}`, config);
                setComponents(response.data.map((component: Component) => ({ ...component })));
            } catch (error) {
                console.error("Error fetching components:", error);
            }
        };

        if (session?.backendTokens.accessToken) {
            fetchComponents();
        }
    }, [session?.backendTokens.accessToken, params.id]);

    const validateForm = () => {
        const newErrors = {
            incidentName: '',
            severity: '',
            selectedComponents: ''
        };

        let isValid = true;

        if (incidentName.trim() === '') {
            newErrors.incidentName = 'Incident name is required';
            isValid = false;
        }

        if (selectedSeverity.trim() === '') {
            newErrors.severity = 'Severity is required';
            isValid = false;
        }

        if (selectedComponents.length === 0) {
            newErrors.selectedComponents = 'At least one component must be selected';
            isValid = false;
        }

        setFormErrors(newErrors);
        return isValid;
    };

    const handleCreateIncident = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${session?.backendTokens.accessToken}` },
            };

            const incidentData = {
                name: incidentName,
                severity: selectedSeverity,
                statusCode: parseInt(selectedStatus),
                statusMessage: updateMessage,
                pageId: parseInt(params.id),
                componentIds: selectedComponents.map(component => component.id),
            };

            const response = await axios.post(BACKEND_URL + "/incident", incidentData, config);
            if (response.data.id) {
                router.replace(`/pages/${params.id}/incidents`);

                await axios.put(BACKEND_URL + `/incident/${response.data.id}`, {
                    components: selectedComponents.map(component => ({
                        id: component.id,
                        status: component.status,
                    })),
                }, config);

                toast.success("Incident created successfully!");
            }
        } catch (error) {
            toast.error("Error creating incident.");
            console.error("Error creating incident:", error);
        }
    };

    const toggleComponentSelection = (component: Component) => {
        const isSelected = selectedComponents.some(
            (selected) => selected.id === component.id
        );

        if (isSelected) {
            setSelectedComponents((prev) =>
                prev.filter((selected) => selected.id !== component.id)
            );
        } else {
            setSelectedComponents((prev) => [
                ...prev,
                { id: component.id, name: component.name, status: component.status },
            ]);
        }
    };

    const updateComponentStatus = (id: number, status: number) => {
        setComponents((prev) =>
            prev.map((component) =>
                component.id === id ? { ...component, status } : component
            )
        );

        setSelectedComponents((prev) =>
            prev.map((selected) =>
                selected.id === id ? { ...selected, status } : selected
            )
        );
    };

    return (
        <div className="w-screen px-4 sm:px-6 md:w-[80vw] mt-4 sm:mt-6 flex flex-col items-center">
            <div className="w-full md:w-[90vw] lg:w-[45vw] space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">Create New Incident</h2>
                <Separator className="w-full h-[2px] bg-gray-300 my-2" />
                <div className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="incidentName" className="mb-2">Incident Name</Label>
                        <Textarea
                            id="incidentName"
                            placeholder="Incident name..."
                            value={incidentName}
                            onChange={(e) => setIncidentName(e.target.value)}
                            className="w-full min-h-10 drop-shadow-lg resize-none"
                        />
                        {formErrors.incidentName && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.incidentName}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="severity" className="mb-2">Severity</Label>
                        <Select
                            value={selectedSeverity}
                            onValueChange={setSelectedSeverity}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]" id="severity">
                                <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent>
                                {severityOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {formErrors.severity && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.severity}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="status" className="mb-2">Incident Status</Label>
                        <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]" id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {incidentStatusOptions.map(option => (
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
                            className="w-full min-h-[50px] drop-shadow-lg"
                        />
                    </div>
                </div>
            </div>

            <div className="w-full md:w-[90vw] lg:w-[45vw] space-y-4 py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <h2 className="text-lg sm:text-xl font-semibold">Affected Components</h2>
                    <Button
                        onClick={() => {
                            if (selectedComponents.length === components.length) {
                                setSelectedComponents([]);
                            } else {
                                setSelectedComponents(components);
                            }
                        }}
                        variant="link"
                        className="p-0 h-auto"
                    >
                        {selectedComponents.length === components.length ? "Deselect All" : "Select All"}
                    </Button>
                </div>
                <Separator className="w-full h-[2px] bg-gray-300 my-2" />
                <div className="space-y-4">
                    {components.map((component) => {
                        const isSelected = selectedComponents.some(
                            (selected) => selected.id === component.id
                        );

                        return (
                            <div
                                key={component.id}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 gap-3 sm:gap-4 bg-card/50 backdrop-blur-sm rounded-lg border border-card-foreground/10 shadow-lg"
                            >
                                <span className="flex items-center gap-2">
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() =>
                                            toggleComponentSelection(component)
                                        }
                                    />
                                    <p className="text-sm sm:text-base">{component.name}</p>
                                </span>
                                <div className="w-full sm:w-[220px]">
                                    {isSelected && (
                                        <Select
                                            value={String(component.status)}
                                            onValueChange={(value) =>
                                                updateComponentStatus(component.id, parseInt(value))
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {componentStatusOptions.map((option) => (
                                                    <SelectItem
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        <div className="flex flex-row items-center gap-2">
                                                            {option.icon}
                                                            <p>{option.label}</p>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {formErrors.selectedComponents && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.selectedComponents}</p>
                )}
            </div>

            <div className="w-full md:w-[90vw] lg:w-[45vw] flex justify-end py-2">
                <Button
                    onClick={handleCreateIncident}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                    Create Incident
                </Button>
            </div>
        </div>
    );
}