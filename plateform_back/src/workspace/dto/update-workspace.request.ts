import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { WORKSPACE_NAME_MAX_LENGTH } from 'src/workspace/dto/create-workspace.request';

export class UpdateWorkspaceRequest {
    @ApiProperty({ example: 'Acme', description: 'Workspace name' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(WORKSPACE_NAME_MAX_LENGTH)
    name: string;
}
