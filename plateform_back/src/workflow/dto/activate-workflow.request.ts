import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ActivateWorkflowRequest {
    @ApiProperty({ description: 'Workflow ID to activate' })
    @IsString()
    @IsNotEmpty()
    id: string;
}
