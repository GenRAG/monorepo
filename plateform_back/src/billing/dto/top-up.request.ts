import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';
import { MAX_TOP_UP_EUROS, MIN_TOP_UP_EUROS } from 'src/plans/plans.config';

export class TopUpRequest {
    @ApiProperty({ example: 20, description: 'Amount in whole euros (1 € = 1 000 credits)' })
    @IsInt()
    @Min(MIN_TOP_UP_EUROS)
    @Max(MAX_TOP_UP_EUROS)
    amountEuros: number;
}
