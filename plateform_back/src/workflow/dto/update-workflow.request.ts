import { PartialType } from '@nestjs/swagger';
import { CreateWorkflowRequest } from './create-workflow.request';

export class UpdateWorkflowRequest extends PartialType(CreateWorkflowRequest) {}
