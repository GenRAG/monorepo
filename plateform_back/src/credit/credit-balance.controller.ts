import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreditBalanceService } from 'src/credit/credit-balance.service';
import { WorkspaceMemberGuard } from 'src/workspace/guards/workspace-member.guard';

@Controller('workspaces/:workspaceId/credit-balance')
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
export class CreditBalanceController {
    constructor(private readonly creditBalanceService: CreditBalanceService) {}

    @Get()
    getBalance(@Param('workspaceId') workspaceId: string) {
        return this.creditBalanceService.getBalanceSummary(workspaceId);
    }
}
