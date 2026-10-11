import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MAX_RUNTIME_QUERY_LENGTH } from 'src/agent-runtime/agent-runtime.types';

export class CompareOnboardingRequest {
    @IsString()
    @IsNotEmpty()
    @MaxLength(MAX_RUNTIME_QUERY_LENGTH)
    query: string;
}

export class CompareOnboardingResponse {
    standard: string;
    precise: string;
    creative: string;
}
