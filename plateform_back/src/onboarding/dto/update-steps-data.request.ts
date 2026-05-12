import { IsObject, IsString } from 'class-validator';

export class UpdateStepsDataRequest {
    @IsString()
    stepId: string;

    @IsObject()
    data: Record<string, unknown>;
}
