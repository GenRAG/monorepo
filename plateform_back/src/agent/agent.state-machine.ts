import { AgentStatus } from 'generated/prisma';
import { AgentState } from 'src/agent/states/agent-state.interface';
import { DevelopmentState } from 'src/agent/states/development.state';
import { ProductionState } from 'src/agent/states/production.state';
import { StagingState } from 'src/agent/states/staging.state';

export class AgentStateMachine {
    private state: AgentState;

    constructor(current: AgentStatus) {
        this.state = AgentStateMachine.resolve(current);
    }

    setState(state: AgentState) {
        this.state = state;
    }

    toStaging() {
        this.state.toStaging(this);
    }

    toProduction() {
        this.state.toProduction(this);
    }

    toDevelopment() {
        this.state.toDevelopment(this);
    }

    static resolve(status: AgentStatus): AgentState {
        switch (status) {
            case AgentStatus.DEVELOPMENT:
                return new DevelopmentState();
            case AgentStatus.STAGING:
                return new StagingState();
            case AgentStatus.PRODUCTION:
                return new ProductionState();
        }
    }
}
