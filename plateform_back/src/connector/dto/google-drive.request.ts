import { ApiProperty } from '@nestjs/swagger';
import {
    ArrayMaxSize,
    ArrayNotEmpty,
    ArrayUnique,
    IsArray,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
} from 'class-validator';

/** Short-lived OAuth token (scope drive.file) obtained in the browser: used for this request only, never stored. */
export class GoogleDriveSyncRequest {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(4096)
    accessToken: string;
}

export class GoogleDriveImportRequest extends GoogleDriveSyncRequest {
    @ApiProperty({
        type: [String],
        description: 'Ids of the files picked in the Google Picker',
    })
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @ArrayMaxSize(20)
    // Interpolated into the Drive API URL.
    @Matches(/^[\w-]+$/, { each: true })
    fileIds: string[];
}
