import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

class InitialWorkflowDto {
    @ApiProperty()
    @IsObject()
    definition: Record<string, unknown>;
}

export class CreateAgentRequest {
    @ApiProperty({ example: 'Support Assistant' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'AI-powered customer support assistant' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => InitialWorkflowDto)
    workflow?: InitialWorkflowDto;
}
