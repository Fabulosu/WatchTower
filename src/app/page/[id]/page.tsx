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
    const [hasOpenIncidents, setHasOpenIncidents] = useState<boolean>(false);

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/page/${pageId}`);

                const openIncidents = response.data.components.some((component: Component) =>
                    component.incidents.some((incident: Incident) => !incident.resolvedAt)
                );

                setHasOpenIncidents(openIncidents);
                setPageData(response.data);
            } catch (error) {
                console.error('Error fetching page data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPageData();
    }, []);

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
                <div className="flex flex-wrap space-x-1 mb-4">
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
                <div className='flex justify-between w-full'>
                    <p className='text-gray-500'>90 days ago</p>
                    <div className='flex-1 h-[1px] mt-[0.75rem] ml-[1rem] mr-[1rem] bg-gray-500'></div>
                    <p className='text-gray-500'>{totalUptime}% uptime</p>
                    <div className='flex-1 h-[1px] mt-[0.75rem] ml-[1rem] mr-[1rem] bg-gray-500'></div>
                    <p className='text-gray-500'>Today</p>
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
        <div className="container flex flex-col lg:w-[58vw] items-center mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6 text-white">{pageData.name}</h1>

            {!hasOpenIncidents && (
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
            <div className='flex flex-col gap-2'>
                {pageData.components.map((component) => (
                    <div key={component.id} className="bg-gray-800 rounded-lg p-4 shadow-2xl">
                        <h2 className="text-xl font-semibold text-white">{component.name}</h2>
                        <div className='flex justify-between w-full'>
                            <p className="text-gray-500">{component.description}</p>
                            <p className={`${component.status == 1 ? "text-green-400" : component.status == 2 ? "text-yellow-400" : component.status == 3 ? "text-orange-400" : component.status == 4 ? "text-red-400" : component.status == 5 ? "text-blue-400" : ""} font-light text-sm mb-4`}>
                                {component.status == 1 ? "Operational" : component.status == 2 ? "Degraded Performance" : component.status == 3 ? "Partial Outage" : component.status == 4 ? "Major Outage" : component.status == 5 ? "Under Maintenance" : ""}
                            </p>
                        </div>

                        {renderUptimeBars(component)}

                        {component.incidents.length > 0 ? (
                            <div className="bg-gray-100 w-full mt-2 text-wrap p-4 rounded-lg">
                                <h3 className="font-semibold">Incidents</h3>
                                {component.incidents.map((incident) => (
                                    <div key={incident.id} className="mt-4">
                                        <p className="font-semibold">
                                            {incident.name} - <span className="text-red-600">{incident.status}</span>
                                        </p>
                                        <p className="text-gray-600">Severity: {incident.severity}</p>
                                        <p className="text-gray-600">Created at: {new Date(incident.createdAt).toLocaleString()}</p>
                                        {incident.resolvedAt && (
                                            <p className="text-green-600">Resolved at: {new Date(incident.resolvedAt).toLocaleString()}</p>
                                        )}

                                        {incident.history.length > 0 && (
                                            <div className="mt-2">
                                                <h4 className="font-semibold">Incident History</h4>
                                                {incident.history.sort((a, b) => b.id - a.id).map((status) => (
                                                    <p key={status.id} className="text-gray-600">
                                                        {new Date(status.createdAt).toLocaleString()} - {status.statusMessage}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
}