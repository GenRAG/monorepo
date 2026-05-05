import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentRepository } from 'src/agent/agent.repository';

@Module({
    controllers: [AgentController],
    providers: [AgentService, AgentRepository],
    imports: [PrismaModule],
    exports: [AgentService, AgentRepository],
})
export class AgentModule {}
