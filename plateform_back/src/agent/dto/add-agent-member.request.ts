import { IsEmail } from 'class-validator';

export class AddAgentMemberRequest {
    @IsEmail()
    email: string;
}
