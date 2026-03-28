import EventBus from 'src/lib/event-bus';
import { UsageTrackerService } from 'src/usage-tracker/usage-tracker.service';
import {
    AgentQueryCompletedEvent,
    AgentDeployedEvent,
    AgentStatusChangedEvent,
} from './agent-events';
import { AgentEventType } from 'src/events/agent-events.type';

export function registerAgentListeners(usageTracker: UsageTrackerService) {
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
                    console.error('[UsageTracker] record failed:', err);
                    throw err;
                });
        },
    );

    EventBus.on(AgentEventType.AGENT_DEPLOYED, (event: AgentDeployedEvent) => {
        console.log(
            `[AgentListener] agent=${event.agentId} deployed v${event.version}`,
        );
    });

    EventBus.on(
        AgentEventType.STATUS_CHANGED,
        (event: AgentStatusChangedEvent) => {
            console.log(
                `[AgentListener] ${event.agentId}: ${event.fromStatus} → ${event.toStatus}`,
            );
        },
    );
}
