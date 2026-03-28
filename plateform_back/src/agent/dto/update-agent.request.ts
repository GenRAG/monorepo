import { PartialType } from '@nestjs/swagger';
import { CreateAgentRequest } from './create-agent.request';
import { IsEnum, IsOptional } from 'class-validator';
import { AgentStatus } from 'generated/prisma';

export class UpdateAgentRequest extends PartialType(CreateAgentRequest) {
    @IsEnum(AgentStatus)
    @IsOptional()
    status?: AgentStatus;
}
