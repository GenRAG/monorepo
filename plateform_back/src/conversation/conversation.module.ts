import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { ConversationRepository } from './conversation.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentRuntimeModule } from 'src/agent-runtime/agent-runtime.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
    controllers: [ConversationController],
    providers: [ConversationService, ConversationRepository],
    imports: [PrismaModule, AgentRuntimeModule, StorageModule],
})
export class ConversationModule {}
