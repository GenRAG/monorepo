import { AgentStateMachine } from 'src/agent/agent.state-machine';
import { AgentState } from './agent-state.interface';
import { StagingState } from './staging.state';

export class ProductionState extends AgentState {
    getName() {
        return 'PRODUCTION';
    }

    toDevelopment(context: AgentStateMachine): void {
        context.setState(new StagingState());
    }
}
