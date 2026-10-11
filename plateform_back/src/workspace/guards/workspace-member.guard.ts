import { CanActivate, ExecutionContext, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { WorkspaceRepository } from 'src/workspace/workspace.repository';

/** Lets through the members of the workspace in the path (`:workspaceId`, `:id` or `workspaceId` in the body). */
@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
    constructor(private readonly workspaceRepository: WorkspaceRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { user, params } = request;
        const workspaceId = params?.workspaceId ?? params?.id ?? request.body?.workspaceId;

        if (!user || !workspaceId) return false;

        const membership = await this.workspaceRepository.findMembership(user.userId, workspaceId);
        if (membership) return true;

        if (!(await this.workspaceRepository.exists(workspaceId))) throw new NotFoundException('Workspace not found');
        throw new ForbiddenException("Acces refusé : l'utilisateur n'est pas membre de cet espace de travail");
    }
}
