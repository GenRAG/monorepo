import { Body, Controller, Get, Param, Post, Query, Sse, UseGuards } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CurrentUserPipe } from 'src/users/pipes/user-validation.pipe';
import { UserSafe } from 'src/users/dto/create-user.request';
import { AgentRuntimeService } from 'src/agent-runtime/agent-runtime.service';
import { OnboardingService } from './onboarding.service';
import { UpdateStepRequest } from './dto/update-step.request';
import { CompleteOnboardingRequest } from './dto/complete-onboarding.request';
import { OnboardingSessionResponse } from './dto/onboarding-session.response';
import { CompareOnboardingRequest, CompareOnboardingResponse } from './dto/compare-onboarding.request';
import { UpdateStepsDataRequest } from './dto/update-steps-data.request';

@Controller('workspaces/:workspaceId/onboarding')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard)
export class OnboardingController {
    constructor(
        private readonly onboardingService: OnboardingService,
        private readonly agentRuntimeService: AgentRuntimeService,
    ) {}

    @Post('start')
    start(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
    ): Promise<OnboardingSessionResponse> {
        return this.onboardingService.start(user.id, workspaceId);
    }

    @Get('session')
    getSession(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
    ): Promise<OnboardingSessionResponse | null> {
        return this.onboardingService.getSession(user.id, workspaceId);
    }

    @Post('step')
    updateStep(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
        @Body() body: UpdateStepRequest,
    ): Promise<OnboardingSessionResponse> {
        return this.onboardingService.updateStep(user.id, workspaceId, body.step);
    }

    @Post('steps-data')
    updateStepsData(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
        @Body() body: UpdateStepsDataRequest,
    ): Promise<void> {
        return this.onboardingService.updateStepsData(user.id, workspaceId, body.stepId, body.data);
    }

    @Post('compare')
    compare(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
        @Body() body: CompareOnboardingRequest,
    ): Promise<CompareOnboardingResponse> {
        return this.onboardingService.compare(user.id, workspaceId, body.query);
    }

    @Post('complete')
    complete(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
        @Body() body: CompleteOnboardingRequest,
    ): Promise<void> {
        return this.onboardingService.complete(user.id, workspaceId, body.style);
    }

    @Sse('stream')
    stream(
        @Param('workspaceId') workspaceId: string,
        @Query('query') query: string,
        @Query('agentId') agentId: string,
        @Query('stepId') stepId: string,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
    ): Observable<MessageEvent> {
        if (!query || !agentId) {
            return new Observable((s) => {
                s.next({
                    data: JSON.stringify({
                        error: 'query and agentId parameters required',
                    }),
                });
                s.complete();
            });
        }
        const resolvedStepId = stepId || 'test-assistant';
        const orgId = resolvedStepId === 'test-assistant' ? 'onboarding' : agentId;
        return from(this.onboardingService.checkAndIncrementQueryCount(user.id, workspaceId, resolvedStepId)).pipe(
            switchMap(() => this.agentRuntimeService.streamWithOrgOverride(workspaceId, agentId, query, orgId)),
            catchError(
                () =>
                    new Observable<MessageEvent>((s) => {
                        s.next({
                            data: JSON.stringify({
                                error: 'Limite de messages atteinte pour cette étape.',
                                isLimitReached: true,
                            }),
                        });
                        s.complete();
                    }),
            ),
        );
    }
}
