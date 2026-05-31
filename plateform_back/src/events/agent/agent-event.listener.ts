import EventBus from 'src/lib/event-bus';
import { UsageTrackerService } from 'src/credit/usage-tracker.service';
import { AgentQueryCompletedEvent, AgentDeployedEvent, AgentStatusChangedEvent } from './agent-events';
import { AgentEventType } from 'src/events/agent/agent-events.type';
import { Logger } from 'nestjs-pino';

export function registerAgentListeners(usageTracker: UsageTrackerService, logger: Logger): () => void {
    const onQueryCompleted = (event: AgentQueryCompletedEvent) => {
        usageTracker
            .record({
                workspaceId: event.workspaceId,
                agentId: event.agentId,
                tokensUsed: event.tokensUsed,
            })
            .catch((err) => {
                logger.error('[UsageTracker] record failed', err);
            });
    };

    const onDeployed = (event: AgentDeployedEvent) => {
        logger.log(`[AgentListener] agent=${event.agentId} deployed v${event.version}`);
    };

    const onStatusChanged = (event: AgentStatusChangedEvent) => {
        logger.log(`[AgentListener] ${event.agentId}: ${event.fromStatus} → ${event.toStatus}`);
    };

    EventBus.on(AgentEventType.AGENT_QUERY_COMPLETED, onQueryCompleted);
    EventBus.on(AgentEventType.AGENT_DEPLOYED, onDeployed);
    EventBus.on(AgentEventType.STATUS_CHANGED, onStatusChanged);

    return () => {
        EventBus.removeListener(AgentEventType.AGENT_QUERY_COMPLETED, onQueryCompleted);
        EventBus.removeListener(AgentEventType.AGENT_DEPLOYED, onDeployed);
        EventBus.removeListener(AgentEventType.STATUS_CHANGED, onStatusChanged);
    };
}
