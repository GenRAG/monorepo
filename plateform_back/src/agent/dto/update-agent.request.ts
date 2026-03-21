import { PartialType } from '@nestjs/swagger';
import { CreateAgentRequest } from './create-agent.request';

export class UpdateAgentRequest extends PartialType(CreateAgentRequest) {}
