import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PlanTier } from 'generated/prisma';

export class CreateWorkspaceRequest {
    @ApiProperty({
        example: 'Product Team',
        description: 'Workspace name',
    })
    @IsString()
    name: string;

    @ApiPropertyOptional({
        example: 'Dedicated workspace for product squad',
        description: 'Workspace description',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        enum: PlanTier,
        default: PlanTier.FREE,
        description: 'Plan tier — defaults to FREE',
    })
    @IsEnum(PlanTier)
    @IsOptional()
    plan?: PlanTier;
}
