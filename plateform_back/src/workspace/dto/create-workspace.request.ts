import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export const WORKSPACE_NAME_MAX_LENGTH = 60;

export class CreateWorkspaceRequest {
    @ApiProperty({ example: 'Product Team', description: 'Workspace name' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(WORKSPACE_NAME_MAX_LENGTH)
    name: string;

    @ApiPropertyOptional({ example: 'Dedicated workspace for product squad', description: 'Workspace description' })
    @IsString()
    @IsOptional()
    description?: string;
}
