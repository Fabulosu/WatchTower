"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '@/lib/data';
import dayjs from 'dayjs';
import { FaCircle } from 'react-icons/fa6';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { CiCircleQuestion } from 'react-icons/ci';
import Link from 'next/link';
import { calculateTotalUptime, calculateUptimeForDay, cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const getLatestStatus = (history: IncidentStatus[]) => {
    return parseInt(history
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        ?.status.toString());
};

export default function StatusPage({ params }: { params: { id: number } }) {
    const pageId = params.id;
    const [pageData, setPageData] = useState<Page | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [openIncidents, setOpenIncidents] = useState<Incident[]>([]);
    const [maintenancesInProgress, setMaintenancesInProgress] = useState<Incident[]>([]);
    const [maintenances, setMaintenances] = useState<Incident[]>([]);
    const [incidentsByDay, setIncidentsByDay] = useState<{ [key: string]: Incident[] }>({});

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/page/${pageId}`);
                const components = response.data.components;
                const incidentsMap = new Map<number, Incident>();

                components.forEach((component: Component) => {
                    component.incidents.forEach((incident: Incident) => {
                        incidentsMap.set(incident.id, incident);
                    });
                });

                const uniqueIncidents = Array.from(incidentsMap.values());
                const today = dayjs();
                const past14Days = Array.from({ length: 14 }, (_, i) =>
                    today.subtract(i, 'day').format('YYYY-MM-DD')
                );
                const incidentsGroupedByDay: { [key: string]: Incident[] } = {};

                past14Days.forEach((day) => {
                    incidentsGroupedByDay[day] = uniqueIncidents.filter(
                        (incident) =>
                            dayjs(incident.createdAt).format('YYYY-MM-DD') === day
                    );
                });

                setIncidentsByDay(incidentsGroupedByDay);

                const maintenances = uniqueIncidents.filter(
                    (incident) => incident.scheduledAt != null && getLatestStatus(incident.history) === 0
                );

                const maintenancesInProgress = uniqueIncidents.filter(
                    (incident) => incident.scheduledAt != null && getLatestStatus(incident.history) >= 1 && getLatestStatus(incident.history) < 3
                );

                const unresolvedIncidents = uniqueIncidents.filter(
                    (incident) => !incident.resolvedAt && !incident.scheduledAt
                );

                setMaintenances(maintenances);
                setMaintenancesInProgress(maintenancesInProgress);
                setOpenIncidents(unresolvedIncidents);
                setPageData(response.data);
            } catch (error) {
                console.error('Error fetching page data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPageData();
    }, [pageId]);

    useEffect(() => {
        if (pageData) {
            document.title = `${pageData.name} - Status`;
        }
    }, [pageData]);

    const today = dayjs();
    const [daysToShow, setDaysToShow] = useState(90);

    useEffect(() => {
        const initialDaysToShow = window.innerWidth <= 767 ? 30 : window.innerWidth <= 1024 ? 60 : 90;
        setDaysToShow(initialDaysToShow);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setDaysToShow(30);
            } else if (window.innerWidth <= 1024) {
                setDaysToShow(60);
            } else {
                setDaysToShow(90);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const renderUptimeBars = (component: Component) => {
        const lastDays = Array.from({ length: daysToShow }, (_, i) =>
            today.subtract(i, 'day').format('YYYY-MM-DD')
        );

        const uptimeData = lastDays.map((date) => ({
            day: date,
            uptime: calculateUptimeForDay(component.statusHistory, date),
        }));

        const totalUptime = calculateTotalUptime(uptimeData);

        return (
            <>
                <div className="relative w-full">
                    <div className="grid auto-cols-fr grid-flow-col gap-[1px] my-4 w-full">
                        {uptimeData.map((stat, index) => (
                            <TooltipProvider delayDuration={200} key={index}>
                                <Tooltip>
                                    <TooltipTrigger className="w-full hover:cursor-default">
                                        <div className="flex justify-center">
                                            <div
                                                className={`w-full rounded-lg h-8 transform hover:scale-125 transition-all ${stat.uptime >= 90
                                                    ? 'bg-green-500'
                                                    : stat.uptime >= 75
                                                        ? 'bg-yellow-500'
                                                        : stat.uptime >= 50
                                                            ? 'bg-orange-500'
                                                            : 'bg-red-500'
                                                    }`}
                                                style={{
                                                    minWidth: '2px',
                                                    maxWidth: '8px'
                                                }}
                                            ></div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side='bottom'
                                        className='bg-popover drop-shadow-lg border-0 duration-0'
                                    >
                                        <p className='font-semibold text-card-foreground'>
                                            {stat.day}
                                        </p>
                                        <p className='text-card-foreground'>
                                            Uptime {stat.uptime}%
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )).reverse()}
                    </div>
                </div>
                <div className="flex items-center w-full">
                    <p className="text-muted-foreground sm:min-w-[100px]">{daysToShow} days ago</p>
                    <div className="flex-1 h-[1px] mx-4 bg-muted-foreground"></div>
                    <p className="text-center text-muted-foreground">
                        {totalUptime}% uptime
                    </p>
                    <div className="flex-1 h-[1px] mx-4 bg-muted-foreground"></div>
                    <p className="text-muted-foreground sm:min-w-[100px] text-right">
                        Today
                    </p>
                </div>
            </>
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
            </div>
        )
    }

    if (!pageData) {
        return <div className="flex justify-center items-center h-screen text-foreground">No data available</div>;
    }

    return (
        <>
            <main className="px-0 sm:container flex flex-col gap-2 lg:w-[58vw] items-center mx-auto py-8">
                <h1 className="text-3xl font-bold mb-6 text-foreground">{pageData.name}</h1>

                {openIncidents.length > 0 || maintenancesInProgress.length > 0 ? (
                    <div className="bg-card p-4 w-full rounded-lg shadow-2xl">
                        <h2 className="text-3xl font-semibold text-foreground">Ongoing Incidents</h2>
                        {openIncidents.map((incident) => (
                            <div key={incident.id} className="mt-4 bg-secondary p-4 rounded-lg">
                                <p className={`font-semibold text-xl ${incident.severity == "Minor" ? "text-yellow-600" : incident.severity == "Major" ? "text-orange-600" : incident.severity == "Critical" ? "text-red-600" : ""}`}>
                                    {incident.name}
                                </p>
                                <p className="text-muted-foreground"><span className='font-semibold'>Severity: </span>{incident.severity}</p>
                                <p className="text-muted-foreground"><span className='font-semibold'>Created at: </span>{new Date(incident.createdAt).toLocaleTimeString()}</p>
                                {incident.history.length > 0 && (
                                    <div className="mt-2">
                                        <h4 className="font-semibold text-lg">Incident History</h4>
                                        {incident.history.sort((a, b) => b.id - a.id).map((status) => (
                                            <p key={status.id} className="text-muted-foreground flex flex-col">
                                                <span>
                                                    <span className='font-semibold text-muted-foreground'>{status.status === 0 ? "Investigating" : status.status === 1 ? "Identified" : status.status === 2 ? "Monitoring" : status.status === 3 ? "Resolved" : ""}</span> - {status.statusMessage}<br />
                                                </span>
                                                <span className='text-sm font-semibold'>{new Date(status.createdAt).toLocaleTimeString()}</span>
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {maintenancesInProgress.map((maintenance) => (
                            <div key={maintenance.id} className="mt-4 bg-secondary p-4 rounded-lg">
                                <p className={`font-semibold text-xl text-blue-600`}>
                                    {maintenance.name}
                                </p>
                                <p className="text-muted-foreground"><span className='font-semibold'>Severity: </span>{maintenance.severity}</p>
                                <p className="text-muted-foreground"><span className='font-semibold'>Scheduled at: </span>{new Date(maintenance.scheduledAt ? maintenance.scheduledAt : "").toLocaleString()}</p>
                                {maintenance.history.length > 0 && (
                                    <div className="mt-2">
                                        <h4 className="font-semibold text-lg">Maintenance History</h4>
                                        {maintenance.history.sort((a, b) => b.id - a.id).map((status) => (
                                            <p key={status.id} className="text-muted-foreground flex flex-col">
                                                <span>
                                                    <span className='font-semibold text-muted-foreground'>{status.status === 0 ? "Scheduled" : status.status === 1 ? "In Progress" : status.status === 2 ? "Completed" : ""}</span> - {status.statusMessage}<br />
                                                </span>
                                                <span className='text-sm font-semibold'>{new Date(status.createdAt).toLocaleTimeString()}</span>
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-card p-4 mb-6 w-full rounded-lg shadow-2xl">
                        <div className='flex items-center gap-4'>
                            <div>
                                <FaCircle size={25} className='text-green-500 animate-ping2 absolute inline-flex duration-400' />
                                <FaCircle size={25} className='text-green-500 relative inline-flex' />
                            </div>
                            <h2 className="text-3xl font-semibold text-foreground"> All systems <span className='text-green-500'>operational</span></h2>
                        </div>
                    </div>
                )}

                <div className='flex flex-col gap-2 w-full'>
                    {pageData.components
                        .sort((a, b) => a.order - b.order)
                        .map((component) => (
                            <div key={component.id} className="bg-card rounded-lg p-4 shadow-2xl">
                                <div className='flex justify-between items-center w-full'>
                                    <div className='flex gap-2 items-center'>
                                        <h2 className="text-xl font-semibold text-foreground">{component.name}</h2>
                                        {component.description && component.description !== null ? (
                                            <TooltipProvider delayDuration={100}>
                                                <Tooltip>
                                                    <TooltipTrigger className='hover:cursor-default'>
                                                        <CiCircleQuestion size={15} className='text-gray-500' />
                                                    </TooltipTrigger>
                                                    <TooltipContent side='top' className='bg-popover drop-shadow-lg border-0 duration-0'>
                                                        <p className='text-card-foreground'>{component.description}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : null}
                                    </div>
                                    <p className={`${component.status == 1 ? "text-green-500" : component.status == 2 ? "text-yellow-500" : component.status == 3 ? "text-orange-500" : component.status == 4 ? "text-red-500" : component.status == 5 ? "text-blue-500" : ""} font-medium text-sm`}>
                                        {component.status == 1 ? "Operational" : component.status == 2 ? "Degraded Performance" : component.status == 3 ? "Partial Outage" : component.status == 4 ? "Major Outage" : component.status == 5 ? "Under Maintenance" : ""}
                                    </p>
                                </div>
                                {component.displayUptime ? (
                                    renderUptimeBars(component)
                                ) : null}
                            </div>
                        ))}
                </div>
                {maintenances.length > 0 && (
                    <div className='bg-card p-4 w-full rounded-lg shadow-2xl'>
                        <h2 className="text-2xl font-semibold text-foreground">Scheduled Maintenances</h2>
                        {maintenances.map((maintenance) => (
                            <div key={maintenance.id} className="mt-4 bg-secondary p-4 rounded-lg">
                                <p className={`font-semibold text-xl text-blue-600`}>
                                    {maintenance.name}
                                </p>
                                <p className="text-muted-foreground"><span className='font-semibold'>Scheduled at: </span>{new Date(maintenance.scheduledAt ? maintenance.scheduledAt : "").toLocaleString()}</p>
                                {maintenance.history.length > 0 && (
                                    <div className="mt-2">
                                        <h4 className="font-semibold text-lg">Maintenance History</h4>
                                        {maintenance.history.sort((a, b) => b.id - a.id).map((status) => (
                                            <p key={status.id} className="text-muted-foreground flex flex-col">
                                                <span>
                                                    <span className='font-semibold text-muted-foreground'>Scheduled</span> - {status.statusMessage}<br />
                                                </span>
                                                <span className='text-sm font-semibold'>{new Date(status.createdAt).toLocaleTimeString()}</span>
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-card p-4 w-full rounded-lg shadow-2xl">
                    <h2 className="text-2xl font-semibold text-foreground">Incident History (Last 14 Days)</h2>
                    {Object.entries(incidentsByDay).map(([day, incidents]) => (
                        <div key={day} className="mt-4">
                            <h3 className="text-lg font-bold text-foreground">
                                {dayjs(day).format("MMMM D, YYYY")}
                            </h3>
                            <div className="w-full h-[1px] my-2 bg-border" />
                            {incidents.length > 0 ? (
                                <div className="flex flex-col gap-2 py-2 rounded-lg mt-2">
                                    {incidents
                                        .filter((incident) => (incident.scheduledAt ? getLatestStatus(incident.history) >= 1 : true))
                                        .map((incident) => (
                                            <div key={incident.id} className="bg-secondary p-4 rounded-lg">
                                                <p className={`font-semibold text-xl ${incident.severity === "Minor" ? "text-yellow-500" : incident.severity === "Major" ? "text-orange-500" : incident.severity === "Critical" ? "text-red-500" : incident.severity === "Maintenance" ? "text-blue-500" : ""}`}>
                                                    {incident.name}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    <span className="font-semibold">Created at:</span>{" "}
                                                    {new Date(incident.createdAt).toLocaleString()}
                                                </p>
                                                {incident.resolvedAt && (
                                                    <p className="text-muted-foreground">
                                                        <span className="font-semibold">Resolved at:</span>{" "}
                                                        {new Date(incident.resolvedAt).toLocaleString()}
                                                    </p>
                                                )}
                                                {incident.history.length > 0 && (
                                                    <div className="mt-2">
                                                        <h4 className="font-semibold text-card-foreground text-lg">
                                                            Incident History
                                                        </h4>
                                                        {incident.scheduledAt != null ? (
                                                            incident.history.sort((a, b) => b.id - a.id).map((status: IncidentStatus) => (
                                                                <p key={status.id} className="text-muted-foreground flex flex-col">
                                                                    <span>
                                                                        <span className={`font-semibold text-card-foreground`}>
                                                                            {status.status === 0 ? "Scheduled" : status.status === 1 ? "In progress" : status.status === 2 ? "Verifying" : status.status === 3 ? "Completed" : ""}
                                                                        </span>
                                                                        {" "} - {status.statusMessage}
                                                                    </span>
                                                                    <span className="text-sm font-semibold">
                                                                        {new Date(status.createdAt).toLocaleString()}
                                                                    </span>
                                                                </p>
                                                            ))
                                                        ) : (
                                                            incident.history.sort((a, b) => b.id - a.id).map((status: IncidentStatus) => (
                                                                <p key={status.id} className="text-muted-foreground flex flex-col">
                                                                    <span>
                                                                        <span className={`font-semibold text-card-foreground`}>
                                                                            {status.status === 0 ? "Investigating" : status.status === 1 ? "Identified" : status.status === 2 ? "Monitoring" : status.status === 3 ? "Resolved" : ""}
                                                                        </span>
                                                                        {" "} - {status.statusMessage}
                                                                    </span>
                                                                    <span className="text-sm font-semibold">
                                                                        {new Date(status.createdAt).toLocaleString()}
                                                                    </span>
                                                                </p>
                                                            ))
                                                        )}

                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground py-2">No incidents reported today.</p>
                            )}
                        </div>
                    ))}
                </div>
            </main>
            <footer className='flex justify-center pb-8'>
                <Link href="/" className={cn(buttonVariants({ variant: "link" }), 'text-gray-400 text-sm')}>Powered by WatchTower</Link>
            </footer>
        </>
    );
}