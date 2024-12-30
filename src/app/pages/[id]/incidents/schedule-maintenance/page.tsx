"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface Component {
    id: number;
    name: string;
    status: number;
}

export default function CreateMaintenance({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { data: session } = useSession();

    const [maintenanceName, setMaintenanceName] = useState("");
    const [maintenanceMessage, setMaintenanceMessage] = useState("");
    const [scheduleDate, setScheduleDate] = useState("");
    const [scheduleTime, setScheduleTime] = useState("");
    const [scheduleDurationHours, setScheduleDurationHours] = useState<number | undefined>(1);
    const [scheduleDurationMinutes, setScheduleDurationMinutes] = useState<number | undefined>(0);
    const [autoStart, setAutoStart] = useState(false);
    const [autoEnd, setAutoEnd] = useState(false);
    const [components, setComponents] = useState<Component[]>([]);
    const [selectedComponents, setSelectedComponents] = useState<Component[]>([]);
    const [formErrors, setFormErrors] = useState({
        maintenanceName: '',
        scheduleDate: '',
        scheduleTime: '',
        scheduleDuration: '',
        selectedComponents: ''
    });

    useEffect(() => {
        if (session?.backendTokens.accessToken) {
            fetchComponents();
        }
    }, [session?.backendTokens.accessToken]);

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

    const validateForm = () => {
        const newErrors = {
            maintenanceName: '',
            scheduleDate: '',
            scheduleTime: '',
            scheduleDuration: '',
            selectedComponents: ''
        };

        let isValid = true;

        if (maintenanceName.length < 3) {
            newErrors.maintenanceName = 'Maintenance name must be at least 3 characters long';
            isValid = false;
        } else if (maintenanceName.length > 50) {
            newErrors.maintenanceName = 'Maintenance name must be less than 50 characters';
            isValid = false;
        }

        const scheduledAt = new Date(new Date(scheduleDate).toDateString() + ' ' + scheduleTime);
        if (scheduledAt <= new Date()) {
            newErrors.scheduleDate = 'Scheduled date and time must be in the future';
            isValid = false;
        }

        if ((scheduleDurationHours || 0) <= 0 && (scheduleDurationMinutes || 0) <= 0) {
            newErrors.scheduleDuration = 'Duration must be greater than 0';
            isValid = false;
        }

        if (selectedComponents.length === 0) {
            newErrors.selectedComponents = 'At least one component must be selected';
            isValid = false;
        }

        setFormErrors(newErrors);
        return isValid;
    };

    const handleCreateMaintenance = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${session?.backendTokens.accessToken}` },
            };

            const scheduledAt = new Date(new Date(scheduleDate).toDateString() + ' ' + scheduleTime);
            const completeAt = new Date(scheduledAt);
            completeAt.setHours(completeAt.getHours() + (scheduleDurationHours || 0));
            completeAt.setMinutes(completeAt.getMinutes() + (scheduleDurationMinutes || 0));

            const maintenanceData = {
                name: maintenanceName,
                severity: "Maintenance",
                statusCode: 0,
                statusMessage: maintenanceMessage,
                pageId: parseInt(params.id),
                componentIds: selectedComponents.map(component => component.id),
                auto_start: autoStart,
                auto_end: autoEnd,
                scheduledAt: scheduledAt,
                completeAt,
            };

            const response = await axios.post(BACKEND_URL + "/incident", maintenanceData, config);
            if (response.data.id) {
                toast.success("Maintenance scheduled successfully!");
                router.replace(`/pages/${params.id}/incidents`);
            }
        } catch (error) {
            toast.error("Error creating maintenance.");
            console.error("Error creating maintenance:", error);
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

    return (
        <div className="w-screen md:w-[80vw] mt-6 flex flex-col items-center px-4 md:px-0">
            <div className="w-full md:w-[45vw] space-y-4">
                <h2 className="text-xl font-semibold">Schedule Maintenance</h2>
                <Separator className="w-full h-[2px] bg-gray-300 my-2" />
                <div className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="maintenanceName">Maintenance Name</Label>
                        <Textarea
                            id="maintenanceName"
                            placeholder="Maintenance name..."
                            value={maintenanceName}
                            onChange={(e) => setMaintenanceName(e.target.value)}
                            className="min-h-10 drop-shadow-lg resize-none"
                        />
                        {formErrors.maintenanceName && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.maintenanceName}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="scheduleDate">Scheduled Time</Label>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-2 md:justify-between">
                            <DatePicker
                                defaultValue={new Date()}
                                onChange={(val) => {
                                    val && setScheduleDate(val.toLocaleDateString('en-CA'));
                                }}
                            />
                            <div className="flex items-center gap-2">
                                <Input
                                    type="time"
                                    defaultValue={new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                    className="w-auto shadow-lg"
                                    onChange={(e) => setScheduleTime(e.target.value)}
                                    required
                                />
                            </div>
                            <p>for</p>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={scheduleDurationHours}
                                    onChange={(e) => setScheduleDurationHours(Number(e.target.value))}
                                    className="w-20 shadow-lg"
                                />
                                <p>hours</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={scheduleDurationMinutes}
                                    onChange={(e) => setScheduleDurationMinutes(Number(e.target.value))}
                                    className="w-20 shadow-lg"
                                />
                                <p>minutes</p>
                            </div>
                        </div>
                        {formErrors.scheduleDate && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.scheduleDate}</p>
                        )}
                        {formErrors.scheduleDuration && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.scheduleDuration}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="maintenanceMessage">Message</Label>
                        <Textarea
                            id="maintenanceMessage"
                            placeholder="We will be undergoing scheduled maintenance during this time."
                            value={maintenanceMessage}
                            onChange={(e) => setMaintenanceMessage(e.target.value)}
                            className="min-h-[50px] drop-shadow-lg"
                        />
                    </div>

                    <div className="flex gap-2 items-center">
                        <Checkbox id="auto_start" checked={autoStart} onCheckedChange={() => setAutoStart(!autoStart)} />
                        <Label htmlFor="auto_start">Automatically start maintenance at scheduled time</Label>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Checkbox id="auto_end" checked={autoEnd} onCheckedChange={() => setAutoEnd(!autoEnd)} />
                        <Label htmlFor="auto_end">Automatically end maintenance after scheduled time</Label>
                    </div>
                </div>
            </div>

            <div className="w-full md:w-[45vw] space-y-4 py-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Affected Components</h2>
                    <Button
                        onClick={() => {
                            if (selectedComponents.length === components.length) {
                                setSelectedComponents([]);
                            } else {
                                setSelectedComponents(components);
                            }
                        }}
                        variant="link"
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
                                className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-card-foreground/10 shadow-lg min-h-[72px]"
                            >
                                <span className="flex items-center gap-2">
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() =>
                                            toggleComponentSelection(component)
                                        }
                                    />
                                    <p>{component.name}</p>
                                </span>
                            </div>
                        );
                    })}
                </div>
                {formErrors.selectedComponents && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.selectedComponents}</p>
                )}
            </div>

            <div className="w-full md:w-[45vw] md:flex md:justify-end py-2">
                <Button
                    onClick={handleCreateMaintenance}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                    Schedule Maintenance
                </Button>
            </div>
        </div>
    );
}