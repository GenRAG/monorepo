import { IsString } from 'class-validator';

export class CreateWorkspaceRequest {
    @IsString()
    name: string;

    @IsString()
    description: string;
}
