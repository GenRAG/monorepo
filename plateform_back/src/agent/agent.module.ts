import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    controllers: [AgentController],
    providers: [AgentService],
    imports: [PrismaModule],
})
export class AgentModule {}
