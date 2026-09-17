export interface AgentConsumption {
    agentId: string;
    agentName: string;
    creditsUsed: number;
    queryCount: number;
}

export interface WorkspaceConsumption {
    byAgent: AgentConsumption[];
    byDay: number[];
    total: number;
}

export interface CreditBalanceSummary {
    balance: number;
    totalGranted: number;
}
