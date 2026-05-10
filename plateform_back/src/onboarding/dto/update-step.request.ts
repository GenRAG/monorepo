import { IsInt, Max, Min } from 'class-validator';

export class UpdateStepRequest {
    @IsInt()
    @Min(1)
    @Max(3)
    step: number;
}
