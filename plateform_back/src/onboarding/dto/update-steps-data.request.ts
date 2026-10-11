import { IsIn, IsObject } from 'class-validator';
import { ONBOARDING_STEP_IDS } from '../onboarding.constants';

export class UpdateStepsDataRequest {
    @IsIn(ONBOARDING_STEP_IDS)
    stepId: string;

    @IsObject()
    data: Record<string, unknown>;
}
