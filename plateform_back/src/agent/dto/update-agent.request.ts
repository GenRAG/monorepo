import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAgentRequest {
    @ApiPropertyOptional({ example: 'Support Assistant' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ example: 'AI-powered customer support assistant' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: 30, nullable: true, description: 'Retention in days. null = unlimited.' })
    @IsOptional()
    @ValidateIf((o) => o.retentionDays !== null)
    @IsInt()
    @Min(1)
    @Type(() => Number)
    retentionDays?: number | null;
}
