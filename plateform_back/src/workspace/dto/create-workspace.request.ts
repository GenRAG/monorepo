import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateWorkspaceRequest {
    @ApiProperty({
        example: 'Product Team',
        description: 'Workspace name',
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: 'Dedicated workspace for product squad',
        description: 'Workspace description',
    })
    @IsString()
    description: string;
}
