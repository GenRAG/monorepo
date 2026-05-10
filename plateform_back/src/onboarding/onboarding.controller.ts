import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CurrentUserPipe } from 'src/users/pipes/user-validation.pipe';
import { UserSafe } from 'src/users/dto/create-user.request';
import { OnboardingService } from './onboarding.service';
import { UpdateStepRequest } from './dto/update-step.request';
import { CompleteOnboardingRequest } from './dto/complete-onboarding.request';
import { OnboardingSessionResponse } from './dto/onboarding-session.response';
import {
    CompareOnboardingRequest,
    CompareOnboardingResponse,
} from './dto/compare-onboarding.request';
import { UpdateStepsDataRequest } from './dto/update-steps-data.request';

@Controller('workspaces/:workspaceId/onboarding')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard)
export class OnboardingController {
    constructor(private readonly onboardingService: OnboardingService) {}

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
        return this.onboardingService.updateStep(
            user.id,
            workspaceId,
            body.step,
        );
    }

    @Post('steps-data')
    updateStepsData(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
        @Body() body: UpdateStepsDataRequest,
    ): Promise<void> {
        return this.onboardingService.updateStepsData(
            user.id,
            workspaceId,
            body.stepId,
            body.data,
        );
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
    ): Promise<{ success: boolean; instruction: string }> {
        return this.onboardingService.complete(
            user.id,
            workspaceId,
            body.style,
        );
    }
}
