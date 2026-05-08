import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateDeploymentRequest {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    changelog?: string;
}
