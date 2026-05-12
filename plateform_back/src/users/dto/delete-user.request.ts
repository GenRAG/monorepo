import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteUserRequest {
    @ApiProperty({
        example: 'clx8k8j4n0000abc123def456',
        description: 'User identifier to delete',
    })
    @IsString()
    id: string;
}
