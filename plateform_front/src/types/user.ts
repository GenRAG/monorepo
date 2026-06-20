export type UserRole = "ADMIN" | "EDITOR" | "VIEWER";

export interface UserWorkspace {
    workspaceId: string;
    role: UserRole;
    workspace?: Workspace;
}

export interface Workspace {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    email: string;
    name?: string;
    createdAt: string;
    updatedAt: string;
    isEmailVerified: boolean;
    workspaces?: UserWorkspace[];
}

export interface LoginParams {
    email: string;
    password: string;
}

export interface RegisterParams extends LoginParams {
    name: string;
}

export interface AuthResponse {
    tokenPayload: {
        userId: string;
    };
}

export interface VerifyTokenRequest {
    email: string;
    token: number;
}

export interface ResendVerifyTokenRequest {
    email: string;
}

export type ResetPasswordRequest = ResendVerifyTokenRequest;

export interface NewPasswordRequest extends VerifyTokenRequest {
    password: string;
}

export interface UpdateProfileRequest {
    name?: string;
    email?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
