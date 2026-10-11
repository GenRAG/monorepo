import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { DocumentSource } from 'generated/prisma';

export class DocumentPaginationQuery {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;

    /** `?source=UPLOAD&source=NOTION`: a single value arrives as a string, several as an array. */
    @IsOptional()
    @IsEnum(DocumentSource, { each: true })
    source?: DocumentSource | DocumentSource[];
}
