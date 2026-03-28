import { IsString } from 'class-validator';

export class ExecuteAgentRuntimeRequest {
    @IsString()
    query: string;
}
