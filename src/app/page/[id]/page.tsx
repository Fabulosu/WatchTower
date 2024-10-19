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

    incidents.forEach((incident: any) => {
        const incidentStart = dayjs(incident.createdAt);
        const incidentEnd = incident.resolvedAt ? dayjs(incident.resolvedAt) : dayjs(); // If unresolved, use current time
        const incidentDay = incidentStart.format('YYYY-MM-DD');

        // Check if the incident happened on the given date
        if (incidentDay === date) {
            // Calculate downtime in seconds (cap it at 24 hours for a single day)
            const downtime = Math.min(incidentEnd.diff(incidentStart, 'second'), 86400);
            totalDowntimeSeconds += downtime;
        }
    });

    // Uptime formula: 1 - (total downtime / total seconds in a day) * 100
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
    const [uptimeStats, setUptimeStats] = useState<{ day: string; uptime: number }[]>([]);

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/page/${pageId}`);

                const openIncidents = response.data.components.some((component: Component) =>
                    component.incidents.some((incident: Incident) => !incident.resolvedAt)
                );

                console.log(openIncidents)

                const today = dayjs();
                const last90Days = Array.from({ length: 90 }, (_, i) =>
                    today.subtract(i, 'day').format('YYYY-MM-DD')
                );

                const uptimeData = last90Days.map((date) => {
                    let totalUptime = 100; // Assume 100% uptime

                    // For each component, calculate the uptime
                    response.data.components.forEach((component: any) => {
                        const uptimeForDay = calculateUptimeForDay(component.incidents, date);
                        totalUptime = Math.min(totalUptime, uptimeForDay); // Take the minimum uptime across components
                    });

                    return { day: date, uptime: totalUptime };
                });

                console.log(uptimeData)

                setUptimeStats(uptimeData);

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

    // const getSeverityColor = (severity: string) => {
    //     switch (severity) {
    //         case 'Minor':
    //             return 'bg-yellow-500';
    //         case 'Partial':
    //             return 'bg-orange-500';
    //         case 'Major':
    //             return 'bg-red-500';
    //         default:
    //             return 'bg-green-500'; // No incidents = green
    //     }
    // };

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
                        <TooltipProvider key={index}>
                            <Tooltip>
                                <TooltipTrigger className='hover:cursor-default'>
                                    <div
                                        className={`w-[2px] md:w-1 lg:w-2 h-8 rounded-sm hover:scale-125 transition-all ${stat.uptime >= 90 ? 'bg-green-500' : stat.uptime >= 75 ? 'bg-yellow-500' : stat.uptime >= 50 ? 'bg-orange-500' : 'bg-red-500'
                                            }`}
                                    ></div>
                                </TooltipTrigger>
                                <TooltipContent side='bottom' className='bg-gray-400 border-0 duration-0'>
                                    <p>Uptime {stat.uptime}%</p>
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
        return <div className="flex justify-center items-center h-screen text-white">Loading...</div>;
    }

    if (!pageData) {
        return <div className="flex justify-center items-center h-screen text-white">No data available</div>;
    }

    return (
        <div className="container flex flex-col items-center mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6 text-white">{pageData.name}</h1>

            {!hasOpenIncidents && (
                <div className="bg-gray-800 p-4 mb-6 rounded-lg shadow-2xl">
                    <div className='flex items-center gap-4'>
                        <div>
                            <FaCircle size={25} className='text-green-500 animate-ping2 absolute inline-flex duration-300' />
                            <FaCircle size={25} className='text-green-500 relative inline-flex' />
                        </div>
                        <h2 className="text-3xl font-semibold"> All systems <span className='text-green-500'>operational</span></h2>
                    </div>
                </div>
            )}
            <div className='flex flex-col gap-2'>
                {pageData.components.map((component) => (
                    <div key={component.id} className="bg-gray-800 rounded-lg p-4 shadow-2xl">
                        <h2 className="text-xl font-semibold text-white">{component.name}</h2>
                        <div className='flex justify-between w-full'>
                            <p className="text-gray-500">{component.description}</p>
                            <p className={`${component.status == 1 ? "text-green-500" : "text-orange-500"} font-light mb-4`}>{component.status == 1 ? "Operational" : "Outage"}</p>
                        </div>

                        {/* Uptime visualization */}
                        {renderUptimeBars(component)}

                        {/* <div className="flex flex-wrap space-x-1 mb-4">
                            {uptimeStats.map((stat, index) => (
                                <TooltipProvider key={index}>
                                    <Tooltip>
                                        <TooltipTrigger className='hover:cursor-default'>
                                            <div
                                                className={`w-[2px] md:w-1 lg:w-2 h-8 rounded-sm hover:scale-125 transition-all ${stat.uptime >= 90 ? 'bg-green-500' : stat.uptime >= 75 ? 'bg-yellow-500' : stat.uptime >= 50 ? 'bg-orange-500' : 'bg-red-500'
                                                    }`}
                                            ></div>
                                        </TooltipTrigger>
                                        <TooltipContent side='bottom' className='bg-gray-400 border-0 duration-0'>
                                            <p>Uptime {stat.uptime}%</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )).reverse()}
                        </div> */}

                        {/* <div className='flex justify-between w-full'>
                            <p className='text-gray-500'>90 days ago</p>
                            <div className='flex-1 h-[1px] mt-[0.75rem] ml-[1rem] mr-[1rem] bg-gray-500'></div>
                            <p className='text-gray-500'>100% uptime</p>
                            <div className='flex-1 h-[1px] mt-[0.75rem] ml-[1rem] mr-[1rem] bg-gray-500'></div>
                            <p className='text-gray-500'>Today</p>
                        </div> */}

                        {/* Incidents */}
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

                                        {/* Incident history */}
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