import EventBus from 'src/lib/event-bus';
import { AgentDeployedEvent, AgentStatusChangedEvent } from './agent-events';
import { AgentEventType } from 'src/events/agent/agent-events.type';
import { Logger } from 'nestjs-pino';

export function registerAgentListeners(logger: Logger): () => void {
    const onDeployed = (event: AgentDeployedEvent) => {
        logger.log(`[AgentListener] agent=${event.agentId} deployed v${event.version}`);
    };

    const onStatusChanged = (event: AgentStatusChangedEvent) => {
        logger.log(`[AgentListener] ${event.agentId}: ${event.fromStatus} → ${event.toStatus}`);
    };

    EventBus.on(AgentEventType.AGENT_DEPLOYED, onDeployed);
    EventBus.on(AgentEventType.STATUS_CHANGED, onStatusChanged);

    return () => {
        EventBus.removeListener(AgentEventType.AGENT_DEPLOYED, onDeployed);
        EventBus.removeListener(AgentEventType.STATUS_CHANGED, onStatusChanged);
    };
}
