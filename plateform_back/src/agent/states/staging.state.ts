import { AgentState } from './agent-state.interface';
import { ProductionState } from './production.state';
import { DevelopmentState } from './development.state';
import { AgentStateMachine } from 'src/agent/agent.state-machine';

export class StagingState extends AgentState {
    getName() {
        return 'STAGING';
    }

    toProduction(context: AgentStateMachine): void {
        context.setState(new ProductionState());
    }

    toDevelopment(context: AgentStateMachine): void {
        context.setState(new DevelopmentState());
    }
}
