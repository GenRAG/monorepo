import EventBus from 'src/lib/event-bus';
import { UsageTrackerService } from 'src/usage-tracker/usage-tracker.service';
import {
    AgentQueryCompletedEvent,
    AgentDeployedEvent,
    AgentStatusChangedEvent,
} from './agent-events';
import { AgentEventType } from 'src/events/agent/agent-events.type';
import { Logger } from 'nestjs-pino';

export function registerAgentListeners(
    usageTracker: UsageTrackerService,
    logger: Logger,
) {
    EventBus.on(
        AgentEventType.AGENT_QUERY_COMPLETED,
        (event: AgentQueryCompletedEvent) => {
            usageTracker
                .record({
                    workspaceId: event.workspaceId,
                    agentId: event.agentId,
                    tokensUsed: event.tokensUsed,
                })
                .catch((err) => {
                    logger.error('[UsageTracker] record failed', err);
                    throw err;
                });
        },
    );

    EventBus.on(AgentEventType.AGENT_DEPLOYED, (event: AgentDeployedEvent) => {
        logger.log(
            `[AgentListener] agent=${event.agentId} deployed v${event.version}`,
        );
    });

    EventBus.on(
        AgentEventType.STATUS_CHANGED,
        (event: AgentStatusChangedEvent) => {
            logger.log(
                `[AgentListener] ${event.agentId}: ${event.fromStatus} → ${event.toStatus}`,
            );
        },
    );
}
