import { type HeatmapBin, type HeatmapColumn } from "components/charts";
import { type HeatmapDay } from "services/analytics/analytics";

const DAY_MS = 24 * 60 * 60 * 1000;

const toIsoDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const toHeatmapColumns = (days: HeatmapDay[]): HeatmapColumn[] => {
    if (days.length === 0) return [];

    const countByDate = new Map(days.map((d) => [d.date, d.count]));

    const firstDate = new Date(`${days[0].date}T00:00:00`);
    const firstSunday = new Date(firstDate);
    firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay());

    const lastDate = new Date(`${days[days.length - 1].date}T00:00:00`);
    const lastSaturday = new Date(lastDate);
    lastSaturday.setDate(lastSaturday.getDate() + (6 - lastSaturday.getDay()));

    const totalWeeks = Math.round((lastSaturday.getTime() - firstSunday.getTime() + DAY_MS) / (7 * DAY_MS));

    return Array.from({ length: totalWeeks }, (_, week) => {
        const bins: HeatmapBin[] = Array.from({ length: 7 }, (_, row) => {
            const date = new Date(firstSunday);
            date.setDate(date.getDate() + week * 7 + row);
            return { bin: row, count: countByDate.get(toIsoDate(date)) ?? 0, date };
        });
        return { bin: week, bins };
    });
};
