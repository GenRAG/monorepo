import { IsNotEmpty, IsString } from 'class-validator';

export class CompareOnboardingRequest {
    @IsString()
    @IsNotEmpty()
    query: string;
}

export class CompareOnboardingResponse {
    standard: string;
    precise: string;
    creative: string;
}
