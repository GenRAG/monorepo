import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'generated/prisma';

export const ROLES_IN_WORKSPACE_KEY = 'roles_in_workspace';
export const RolesInWorkspace = (...roles: UserRole[]) => SetMetadata(ROLES_IN_WORKSPACE_KEY, roles);
