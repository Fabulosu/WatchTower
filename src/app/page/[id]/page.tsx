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

interface IncidentStatus {
    id: number;
    status: number;
    statusMessage: string;
    createdAt: string;
}

interface Incident {
    id: number;
    name: string;
    scheduleAt: string | null;
    resolvedAt: string | null;
    status: string;
    severity: string;
    createdAt: string;
    updatedAt: string;
    history: IncidentStatus[];
}

interface Component {
    id: number;
    name: string;
    status: number;
    description: string;
    displayUptime: boolean;
    createdAt: string;
    incidents: Incident[];
}

interface PageData {
    id: number;
    name: string;
    companyWebsite: string;
    supportUrl: string;
    createdAt: string;
    updatedAt: string;
    components: Component[];
}

const calculateUptimeForDay = (incidents: any[], date: string) => {
    let totalDowntimeSeconds = 0;
    const startOfDay = dayjs(date).startOf('day');
    const endOfDay = dayjs(date).endOf('day');

    incidents.forEach((incident: any) => {
        const incidentStart = dayjs(incident.createdAt);
        const incidentEnd = incident.resolvedAt ? dayjs(incident.resolvedAt) : dayjs();

        // Incident affects the current day if it overlaps with the date being checked
        if (incidentStart.isBefore(endOfDay) && incidentEnd.isAfter(startOfDay)) {
            // Calculate the overlap between the incident and the current day
            const downtimeStart = incidentStart.isBefore(startOfDay) ? startOfDay : incidentStart;
            const downtimeEnd = incidentEnd.isAfter(endOfDay) ? endOfDay : incidentEnd;

            const downtime = downtimeEnd.diff(downtimeStart, 'second');
            totalDowntimeSeconds += Math.min(downtime, 86400);
        }
    });

    const uptimePercentage = ((1 - totalDowntimeSeconds / 86400) * 100).toFixed(2);
    return Number(uptimePercentage);
};

const calculateTotalUptime = (uptimeData: { day: string; uptime: number }[]) => {
    const totalUptime = uptimeData.reduce((acc, stat) => acc + stat.uptime, 0) / uptimeData.length;
    return totalUptime.toFixed(2);
};

export default function StatusPage({ params }: { params: { id: number } }) {
    const pageId = params.id;
    const [pageData, setPageData] = useState<PageData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [openIncidents, setOpenIncidents] = useState<Incident[]>([]);
    const [incidentsByDay, setIncidentsByDay] = useState<{ [key: string]: Incident[] }>({});

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/page/${pageId}`);
                const components = response.data.components;

                // To store unique incidents, we use a Map with the incident ID as the key.
                const incidentsMap = new Map<number, Incident>();

                // Iterate through components and their incidents
                components.forEach((component: Component) => {
                    component.incidents.forEach((incident: Incident) => {
                        // Add the incident to the map using its ID, ensuring uniqueness
                        incidentsMap.set(incident.id, incident);
                    });
                });

                // Convert the Map to an array to get the unique incidents
                const uniqueIncidents = Array.from(incidentsMap.values());

                // Prepare for grouping incidents by the past 14 days
                const today = dayjs();
                const past14Days = Array.from({ length: 14 }, (_, i) =>
                    today.subtract(i, 'day').format('YYYY-MM-DD')
                );

                const incidentsGroupedByDay: { [key: string]: Incident[] } = {};

                // Group incidents by the day they occurred
                past14Days.forEach((day) => {
                    incidentsGroupedByDay[day] = uniqueIncidents.filter(
                        (incident) =>
                            dayjs(incident.createdAt).format('YYYY-MM-DD') === day
                    );
                });

                setIncidentsByDay(incidentsGroupedByDay);

                // Filter unresolved incidents for display in the "Ongoing Incidents" section
                const unresolvedIncidents = uniqueIncidents.filter(
                    (incident) => !incident.resolvedAt
                );

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

    const renderUptimeBars = (component: Component) => {
        const today = dayjs();
        const last90Days = Array.from({ length: 90 }, (_, i) =>
            today.subtract(i, 'day').format('YYYY-MM-DD')
        );

        const uptimeData = last90Days.map((date) => {
            return {
                day: date,
                uptime: calculateUptimeForDay(component.incidents, date),
            };
        });

        const totalUptime = calculateTotalUptime(uptimeData);

        return (
            <>
                <div className="flex flex-wrap justify-between space-x-1 my-4">
                    {uptimeData.map((stat, index) => (
                        <TooltipProvider delayDuration={200} key={index}>
                            <Tooltip>
                                <TooltipTrigger className='hover:cursor-default'>
                                    <div
                                        className={`w-[2px] md:w-1 lg:w-2 h-8 rounded-sm hover:scale-125 transition-all ${stat.uptime >= 90 ? 'bg-green-500' : stat.uptime >= 75 ? 'bg-yellow-500' : stat.uptime >= 50 ? 'bg-orange-500' : 'bg-red-500'
                                            }`}
                                    ></div>
                                </TooltipTrigger>
                                <TooltipContent side='bottom' className='bg-gray-800 drop-shadow-lg border-0 duration-0'>
                                    <p className='font-semibold text-gray-400'>{stat.day}</p>
                                    <p className='text-gray-400'>Uptime {stat.uptime}%</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )).reverse()}
                </div>
                <div className="flex items-center w-full">
                    <p className="text-gray-500 min-w-[100px]">90 days ago</p>
                    <div className="flex-1 h-[1px] mx-4 bg-gray-500"></div>
                    <p className="text-center text-gray-500">{totalUptime}% uptime</p>
                    <div className="flex-1 flex-grow h-[1px] mx-4 bg-gray-500"></div>
                    <p className="text-gray-500 min-w-[100px] text-right">Today</p>
                </div>

            </>
        );
    };

    if (loading) {
        return <div className="flex justify-center font-semibold items-center h-screen text-white">Loading...</div>;
    }

    if (!pageData) {
        return <div className="flex justify-center items-center h-screen text-white">No data available</div>;
    }

    return (
        <div className="container flex flex-col gap-2 lg:w-[58vw] items-center mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6 text-white">{pageData.name}</h1>

            {openIncidents.length > 0 ? (
                <div className="bg-gray-800 p-4 w-full rounded-lg shadow-2xl">
                    <h2 className="text-3xl font-semibold text-white">Ongoing Incidents</h2>
                    {openIncidents.map((incident) => (
                        <div key={incident.id} className="mt-4 bg-gray-100 p-4 rounded-lg">
                            <p className={`font-semibold text-xl ${incident.severity == "Minor" ? "text-yellow-600" : incident.severity == "Major" ? "text-orange-600" : incident.severity == "Critical" ? "text-red-600" : ""}`}>
                                {incident.name}
                            </p>
                            <p className="text-gray-600"><span className='font-semibold'>Severity: </span>{incident.severity}</p>
                            <p className="text-gray-600"><span className='font-semibold'>Created at: </span>{new Date(incident.createdAt).toLocaleTimeString()}</p>
                            {incident.history.length > 0 && (
                                <div className="mt-2">
                                    <h4 className="font-semibold text-lg">Incident History</h4>
                                    {incident.history.sort((a, b) => b.id - a.id).map((status) => (
                                        <p key={status.id} className="text-gray-600 flex flex-col">
                                            <span>
                                                <span className='font-semibold text-black'>{status.status === 0 ? "Investigating" : status.status === 1 ? "Update" : status.status === 2 ? "Identified" : status.status === 3 ? "Monitoring" : status.status === 4 ? "Resolved" : ""}</span> - {status.statusMessage}<br />
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
                <div className="bg-gray-800 p-4 mb-6 w-full rounded-lg shadow-2xl">
                    <div className='flex items-center gap-4'>
                        <div>
                            <FaCircle size={25} className='text-green-500 animate-ping2 absolute inline-flex duration-400' />
                            <FaCircle size={25} className='text-green-500 relative inline-flex' />
                        </div>
                        <h2 className="text-3xl font-semibold text-white"> All systems <span className='text-green-500'>operational</span></h2>
                    </div>
                </div>
            )}

            <div className='flex flex-col gap-2 w-full'>
                {pageData.components.map((component) => (
                    <div key={component.id} className="bg-gray-800 rounded-lg p-4 shadow-2xl">
                        <div className='flex justify-between items-center w-full'>
                            <div className='flex gap-2 items-center'>
                                <h2 className="text-xl font-semibold text-white">{component.name}</h2>
                                {component.description && component.description !== null ? (
                                    <TooltipProvider delayDuration={100}>
                                        <Tooltip>
                                            <TooltipTrigger className='hover:cursor-default'>
                                                <CiCircleQuestion size={15} className='text-gray-300' />
                                            </TooltipTrigger>
                                            <TooltipContent side='top' className='bg-gray-800 drop-shadow-lg border-0 duration-0'>
                                                <p className='text-gray-300'>{component.description}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : null}

                            </div>

                            <p className={`${component.status == 1 ? "text-green-400" : component.status == 2 ? "text-yellow-400" : component.status == 3 ? "text-orange-400" : component.status == 4 ? "text-red-400" : component.status == 5 ? "text-blue-400" : ""} font-light text-sm`}>
                                {component.status == 1 ? "Operational" : component.status == 2 ? "Degraded Performance" : component.status == 3 ? "Partial Outage" : component.status == 4 ? "Major Outage" : component.status == 5 ? "Under Maintenance" : ""}
                            </p>
                        </div>
                        {component.displayUptime ? (
                            renderUptimeBars(component)
                        ) : null}
                    </div>
                ))}
            </div>
            <div className="bg-gray-800 p-4 mb-6 w-full rounded-lg shadow-2xl">
                <h2 className="text-2xl font-semibold text-white">Incident History (Last 14 Days)</h2>
                {Object.entries(incidentsByDay).map(([day, incidents]) => (
                    <div key={day} className="mt-4">
                        <h3 className="text-lg font-bold text-white">{dayjs(day).format('MMMM D, YYYY')}</h3>
                        <div className='w-full h-[1px] my-2 bg-gray-600' />
                        {incidents.length > 0 ? (
                            <div className="flex flex-col gap-2 py-2 rounded-lg mt-2">
                                {incidents.map((incident) => (
                                    <div key={incident.id} className='bg-gray-100 rounded-lg p-4'>
                                        <p className={`font-semibold text-xl ${incident.severity == "Minor" ? "text-yellow-600" : incident.severity == "Major" ? "text-orange-600" : incident.severity == "Critical" ? "text-red-600" : ""}`}>
                                            {incident.name}
                                        </p>
                                        <p className="text-gray-600"><span className='font-semibold'>Created at: </span>{new Date(incident.createdAt).toLocaleString()}</p>
                                        {incident.resolvedAt && (
                                            <p className="text-gray-600"><span className='font-semibold'>Resolved at: </span>{new Date(incident.resolvedAt).toLocaleString()}</p>
                                        )}
                                        {incident.history.length > 0 && (
                                            <div className="mt-2">
                                                <h4 className="font-semibold text-lg">Incident History</h4>
                                                {incident.history.sort((a, b) => b.id - a.id).map((status) => (
                                                    <p key={status.id} className="text-gray-600 flex flex-col">
                                                        <span>
                                                            <span className='font-semibold text-black'>{status.status === 0 ? "Investigating" : status.status === 1 ? "Update" : status.status === 2 ? "Identified" : status.status === 3 ? "Monitoring" : status.status === 4 ? "Resolved" : ""}</span> - {status.statusMessage}<br />
                                                        </span>
                                                        <span className='text-sm font-semibold'>{new Date(status.createdAt).toLocaleString()}</span>
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 py-2">No incidents reported today.</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}