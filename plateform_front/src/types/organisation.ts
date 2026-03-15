export interface OrganisationPreview {
    id: string;
    name: string;
    agentsCount?: number;
    updatedAt?: string;
}

export interface Organisation {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}
