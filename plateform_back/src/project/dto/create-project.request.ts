import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectRequest {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    workspaceId: string;
}

export class AllProjectQuery {
    @IsString()
    @IsOptional()
    workspaceId?: string;
}
