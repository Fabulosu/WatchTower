interface User {
    id: number;
    email: string;
    name: string;
}

interface Page {
    id: number;
    userId: number;
    components: Component[];
    incidents: Incident[];
    name: string;
    companyWebsite: string | null;
    supportUrl: string | null;
    createdAt: string;
    updatedAt: string | null;
}

interface Component {
    id: number;
    pageId: number;
    name: string;
    status: number;
    description: string;
    displayUptime: boolean;
    createdAt: string;
    incidents: Incident[];
    order: number;
    statusHistory: ComponentStatus[];
}

interface ComponentStatus {
    id: number;
    componentId: number;
    status: number;
    assignedAt: string;
    removedAt: string | null;
}

interface Incident {
    id: number;
    pageId: number;
    components: Component[];
    name: string;
    status: number;
    scheduleAt: string | null;
    resolvedAt: string | null;
    severity: string;
    history: IncidentStatus[];
    createdAt: string;
    updatedAt: string;
}

interface IncidentStatus {
    id: number;
    incidentId: number;
    status: number;
    statusMessage: string;
    createdAt: string;
    updatedAt: string | null;
}