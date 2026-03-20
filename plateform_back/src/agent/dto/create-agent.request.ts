import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateAgentRequest {
    @ApiProperty({
        example: 'Support Assistant',
        description: 'Agent name',
    })
    @IsString()
    name: string;

    @ApiPropertyOptional({
        example: 'AI-powered customer support assistant',
        description: 'Agent functional description',
    })
    @IsString()
    @IsOptional()
    description?: string;
}
