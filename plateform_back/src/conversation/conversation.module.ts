import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { ConversationRepository } from './conversation.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentRuntimeModule } from 'src/agent-runtime/agent-runtime.module';
import { StorageModule } from 'src/storage/storage.module';
import { AgentAccessGuard } from 'src/conversation/guard/agent-access.guard';
import { ConversationAccessGuard } from 'src/conversation/guard/conversation-access.guard';

@Module({
    controllers: [ConversationController],
    providers: [ConversationService, ConversationRepository, AgentAccessGuard, ConversationAccessGuard],
    imports: [PrismaModule, AgentRuntimeModule, StorageModule],
})
export class ConversationModule {}
