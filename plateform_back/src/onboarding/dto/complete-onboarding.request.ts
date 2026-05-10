import { IsIn } from 'class-validator';

export class CompleteOnboardingRequest {
    @IsIn(['standard', 'precise', 'creative'])
    style: string;
}
