import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLES_IN_WORKSPACE_KEY } from 'src/workspace/roles/roles-workspace.decorateur';
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

        const request = context.switchToHttp().getRequest();
        const { user, params } = request;

        const workspaceId =
            params?.workspaceId ?? params?.id ?? request.body?.workspaceId;

        if (!user || !workspaceId) return false;

        const membership = await this.prisma.userWorkspace.findUnique({
            where: {
                userId_workspaceId: {
                    userId: user.userId,
                    workspaceId,
                },
            },
        });

        if (!membership) {
            throw new ForbiddenException(
                "Acces refusé : l'utilisateur n'est pas membre de cet espace de travail",
            );
        }

        request.workspaceMember = membership;

        if (!roles || roles.length === 0) return true;

        if (!roles.includes(membership.role)) {
            throw new ForbiddenException(
                `Acces refusé : l'utilisateur doit avoir l'un des roles suivants pour accéder à cette ressource : ${roles.join(', ')}`,
            );
        }

        return true;
    }
}
