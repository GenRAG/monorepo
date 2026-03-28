// src/agent/states/development.state.ts
import { AgentStateMachine } from 'src/agent/agent.state-machine';
import { AgentState } from './agent-state.interface';
import { StagingState } from 'src/agent/states/staging.state';

export class DevelopmentState extends AgentState {
    getName() {
        return 'DEVELOPMENT';
    }

    toStaging(context: AgentStateMachine): void {
        context.setState(new StagingState());
    }
}
