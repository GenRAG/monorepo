import { IsIn } from 'class-validator';

export type InstructionStyle = 'standard' | 'precise' | 'creative';

const INSTRUCTION_STYLES: InstructionStyle[] = ['standard', 'precise', 'creative'];

export class CompleteOnboardingRequest {
    @IsIn(INSTRUCTION_STYLES)
    style: InstructionStyle;
}
