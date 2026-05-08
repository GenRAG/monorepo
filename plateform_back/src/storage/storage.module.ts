import { Module } from '@nestjs/common';
import { S3StorageStrategy } from './s3.strategy';

@Module({
    providers: [
        {
            provide: 'STORAGE_STRATEGY',
            useClass: S3StorageStrategy,
        },
    ],
    exports: ['STORAGE_STRATEGY'],
})
export class StorageModule {}
