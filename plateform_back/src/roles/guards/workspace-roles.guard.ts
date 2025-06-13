import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLES_IN_WORKSPACE_KEY } from 'src/roles/roles-workspace.decorateur';
import { UserRole } from 'generated/prisma';

@Injectable()
export class WorkspaceRolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_IN_WORKSPACE_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!roles || roles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const workspaceId = request.params.id;

        if (!user || !workspaceId) return false;

        const userWorkspace = await this.prisma.userWorkspace.findUnique({
            where: {
                userId_workspaceId: {
                    userId: user.id,
                    workspaceId,
                },
            },
        });

        if (!userWorkspace || !roles.includes(userWorkspace.role)) {
            throw new ForbiddenException(
                `Access denied: Requires role ${roles.join(' or ')}`,
            );
        }

        return true;
    }
}
