import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RollbackDeploymentRequest {
    @ApiProperty()
    @IsString()
    deploymentId: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    changelog?: string;
}
