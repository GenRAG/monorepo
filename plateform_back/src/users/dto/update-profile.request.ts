import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * No email here: changing it in place would let anyone claim an address they do not own (Google login, password
 * reset and invitations all find the account by email). An email change needs its own flow that verifies the new
 * address before switching to it.
 */
export class UpdateProfileRequest {
    @ApiPropertyOptional({ example: 'Alice' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;
}
