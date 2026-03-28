import { AgentEventType } from 'src/events/agent-events.type';

export interface AgentEvent {
    readonly eventType: string;
    readonly workspaceId: string;
    readonly timestamp: string;
}

export class AgentQueryCompletedEvent implements AgentEvent {
    readonly eventType = AgentEventType.AGENT_QUERY_COMPLETED;
    readonly timestamp = new Date().toISOString();

    constructor(
        readonly workspaceId: string,
        readonly agentId: string,
        readonly tokensUsed: number | undefined,
    ) {}
}

export class AgentDeployedEvent implements AgentEvent {
    readonly eventType = AgentEventType.AGENT_DEPLOYED;
    readonly timestamp = new Date().toISOString();

    constructor(
        readonly workspaceId: string,
        readonly agentId: string,
        readonly version: number,
    ) {}
}

export class AgentStatusChangedEvent implements AgentEvent {
    readonly eventType = AgentEventType.STATUS_CHANGED;
    readonly timestamp = new Date().toISOString();

    constructor(
        readonly workspaceId: string,
        readonly agentId: string,
        readonly fromStatus: string,
        readonly toStatus: string,
    ) {}
}
