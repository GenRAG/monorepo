import { AgentEventType } from 'src/events/agent/agent-events.type';

export interface AgentEvent {
    readonly eventType: string;
    readonly workspaceId: string;
    readonly timestamp: string;
}

export class AgentQueryCompletedEvent implements AgentEvent {
    constructor(
        readonly workspaceId: string,
        readonly agentId: string,
        readonly tokensUsed: number | undefined,
    ) {}

    readonly eventType = AgentEventType.AGENT_QUERY_COMPLETED;
    readonly timestamp = new Date().toISOString();
}

export class AgentDeployedEvent implements AgentEvent {
    constructor(
        readonly workspaceId: string,
        readonly agentId: string,
        readonly version: number,
    ) {}

    readonly eventType = AgentEventType.AGENT_DEPLOYED;
    readonly timestamp = new Date().toISOString();
}

export class AgentStatusChangedEvent implements AgentEvent {
    constructor(
        readonly workspaceId: string,
        readonly agentId: string,
        readonly fromStatus: string,
        readonly toStatus: string,
    ) {}

    readonly eventType = AgentEventType.STATUS_CHANGED;
    readonly timestamp = new Date().toISOString();
}
