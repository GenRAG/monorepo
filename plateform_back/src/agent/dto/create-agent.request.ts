import { IsOptional, IsString } from 'class-validator';

export class CreateAgentRequest {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsString()
    workspaceId: string;
}
