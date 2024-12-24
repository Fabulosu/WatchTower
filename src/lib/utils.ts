import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from 'dayjs';

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
  severity: string;
  createdAt: string;
  updatedAt: string;
  history: IncidentStatus[];
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateUptimeForDay = (incidents: Incident[], date: string) => {
  let totalDowntimeSeconds = 0;
  const startOfDay = dayjs(date).startOf('day');
  const endOfDay = dayjs(date).endOf('day');

  incidents.forEach((incident: Incident) => {
    const incidentStart = dayjs(incident.createdAt);
    const incidentEnd = incident.resolvedAt ? dayjs(incident.resolvedAt) : dayjs();

    if (incidentStart.isBefore(endOfDay) && incidentEnd.isAfter(startOfDay)) {
      const downtimeStart = incidentStart.isBefore(startOfDay) ? startOfDay : incidentStart;
      const downtimeEnd = incidentEnd.isAfter(endOfDay) ? endOfDay : incidentEnd;

      const downtime = downtimeEnd.diff(downtimeStart, 'second');
      totalDowntimeSeconds += Math.min(downtime, 86400);
    }
  });

  const uptimePercentage = ((1 - totalDowntimeSeconds / 86400) * 100).toFixed(2);
  return Number(uptimePercentage);
};

export const calculateTotalUptime = (uptimeData: { day: string; uptime: number }[]) => {
  const totalUptime = uptimeData.reduce((acc, stat) => acc + stat.uptime, 0) / uptimeData.length;
  return totalUptime.toFixed(2);
};