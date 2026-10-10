import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayUnique, IsArray, IsString } from 'class-validator';

export class SetDatasetAgentsRequest {
    @ApiProperty({ type: [String], example: ['agent-id-1', 'agent-id-2'] })
    @IsArray()
    @ArrayUnique()
    @ArrayMaxSize(200)
    @IsString({ each: true })
    agentIds: string[];
}
