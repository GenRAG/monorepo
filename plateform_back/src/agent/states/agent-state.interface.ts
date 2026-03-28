import { ForbiddenException } from '@nestjs/common';
import { AgentStateMachine } from 'src/agent/agent.state-machine';

export abstract class AgentState {
    abstract getName(): string;

    toStaging(_context: AgentStateMachine): void {
        throw new ForbiddenException(
            `Cannot transition to STAGING from ${this.getName()}.`,
        );
    }

    toProduction(_context: AgentStateMachine): void {
        throw new ForbiddenException(
            `Cannot transition to PRODUCTION from ${this.getName()}.`,
        );
    }

    toDevelopment(_context: AgentStateMachine): void {
        throw new ForbiddenException(
            `Cannot transition to DEVELOPMENT from ${this.getName()}.`,
        );
    }
}
