import { IsString } from 'class-validator';

export class CompareOnboardingRequest {
    @IsString()
    query: string;
}

export class CompareOnboardingResponse {
    standard: string;
    precise: string;
    creative: string;
}
