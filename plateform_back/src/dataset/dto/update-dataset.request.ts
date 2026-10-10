import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDatasetRequest {
    @ApiPropertyOptional({ example: 'Base juridique' })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({
        example: 'Code du travail et conventions collectives',
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;
}
