import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateWorkflowRequest {
    @ApiProperty({ example: 'Mon workflow v1', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        example: {
            blocks: [
                { name: 'query', type: 'query' },
                {
                    name: 'retrieve',
                    type: 'retrieve',
                    collection_name: 'genrag_kb',
                    top_k: 5,
                },
                {
                    name: 'answer',
                    type: 'answer',
                    model: 'google/gemini-2.5-flash',
                },
            ],
        },
    })
    @IsObject()
    definition: Record<string, unknown>;
}
