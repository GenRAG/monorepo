import { Module } from '@nestjs/common';
import { RetentionCleanupService } from './retention-cleanup.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [RetentionCleanupService],
})
export class RetentionModule {}
