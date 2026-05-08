export enum UserRole {
    ADMIN = "ADMIN",
    EDITOR = "EDITOR",
    VIEWER = "VIEWER",
}

export interface Workspace {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    description: string | null;
    users: {
        userId: string;
        workspaceId: string;
        role: UserRole;
    }[];
}

export interface WorkspaceDetail extends Workspace {
    creditBalance: {
        balance: number;
    };
    agents: {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        workflows: {
            id: string;
            definition: unknown;
            isActive: boolean;
        }[];
        documents: {
            id: string;
        }[];
    }[];
}

export interface WorkspaceCreateRequest {
    name: string;
    description?: string;
}
