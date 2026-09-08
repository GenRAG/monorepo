import { Type } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

export const ANALYTICS_PERIOD_DAYS = [7, 30, 90] as const;
export type AnalyticsPeriodDays = (typeof ANALYTICS_PERIOD_DAYS)[number];

export class AnalyticsPeriodQuery {
    @IsOptional()
    @Type(() => Number)
    @IsIn(ANALYTICS_PERIOD_DAYS)
    days?: AnalyticsPeriodDays;
}
