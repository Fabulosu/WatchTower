import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from 'dayjs';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateUptimeForDay = (statusHistory: ComponentStatus[], date: string) => {
  let totalDowntimeSeconds = 0;
  const startOfDay = dayjs(date).startOf("day");
  const endOfDay = dayjs(date).isSame(dayjs(), "day") ? dayjs() : dayjs(date).endOf("day");

  statusHistory.forEach((status: ComponentStatus) => {
    if (status.status === 3 || status.status === 4) {
      const statusStart = dayjs(status.assignedAt);
      const statusEnd = status.removedAt ? dayjs(status.removedAt) : endOfDay;

      if (statusStart.isBefore(endOfDay) && statusEnd.isAfter(startOfDay)) {
        const downtimeStart = statusStart.isBefore(startOfDay) ? startOfDay : statusStart;
        const downtimeEnd = statusEnd.isAfter(endOfDay) ? endOfDay : statusEnd;

        const downtime = Math.max(downtimeEnd.diff(downtimeStart, "second"), 0);
        totalDowntimeSeconds += downtime;
      }
    }
  });

  const totalDaySeconds = endOfDay.diff(startOfDay, "second");
  const uptimePercentage = ((1 - totalDowntimeSeconds / totalDaySeconds) * 100).toFixed(2);

  return Number(uptimePercentage);
};

export const calculateTotalUptime = (uptimeData: { day: string; uptime: number }[]) => {
  const totalUptime = uptimeData.reduce((acc, stat) => acc + stat.uptime, 0) / uptimeData.length;
  return totalUptime.toFixed(2);
};