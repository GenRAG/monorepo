import { CanActivate, ExecutionContext, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'generated/prisma';
import { WorkspaceRepository } from 'src/workspace/workspace.repository';
import { ROLES_IN_WORKSPACE_KEY } from 'src/workspace/roles/roles-workspace.decorator';

@Injectable()
export class WorkspaceRolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly workspaceRepository: WorkspaceRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_IN_WORKSPACE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const request = context.switchToHttp().getRequest();
        const { user, params } = request;
        const workspaceId = params?.workspaceId ?? params?.id ?? request.body?.workspaceId;

        if (!user || !workspaceId) return false;

        const membership = await this.workspaceRepository.findMembership(user.userId, workspaceId);

        if (!membership) {
            const exists = await this.workspaceRepository.exists(workspaceId);
            if (!exists) throw new NotFoundException('Workspace not found');
            throw new ForbiddenException("Acces refusé : l'utilisateur n'est pas membre de cet espace de travail");
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
