import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAgentRequest {
    @ApiPropertyOptional({ example: 'Support Assistant' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ example: 'AI-powered customer support assistant' })
    @IsString()
    @IsOptional()
    description?: string;
}
