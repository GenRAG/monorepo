import {
    CanActivate,
    ExecutionContext,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AgentBelongsToWorkspaceGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const { workspaceId, agentId, id } = request.params;

        const effectiveAgentId = agentId ?? id;

        if (!effectiveAgentId || !workspaceId) {
            return true;
        }
        const agent = await this.prisma.agent.findFirst({
            where: { id: effectiveAgentId, workspaceId },
        });

        if (!agent) {
            throw new NotFoundException('Agent pas trouvé');
        }

        return true;
    }
}
