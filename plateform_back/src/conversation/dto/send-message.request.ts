import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageRequest {
    @IsString()
    @IsNotEmpty()
    question: string;
}
