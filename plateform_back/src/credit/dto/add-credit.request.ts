import { IsInt, Min } from 'class-validator';

export class AddCreditRequest {
    @IsInt()
    @Min(1)
    amount: number;
}
