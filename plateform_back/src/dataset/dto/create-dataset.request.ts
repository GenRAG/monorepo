import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDatasetRequest {
    @ApiProperty({ example: 'Base juridique' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ApiPropertyOptional({
        example: 'Code du travail et conventions collectives',
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;
}
