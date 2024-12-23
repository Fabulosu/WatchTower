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
    companyWebsite: string;
    supportUrl: string;
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