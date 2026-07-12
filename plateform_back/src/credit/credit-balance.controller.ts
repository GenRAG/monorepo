import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreditBalanceService } from 'src/credit/credit-balance.service';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';

@Controller('workspaces/:workspaceId/credit-balance')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard)
export class CreditBalanceController {
    constructor(private readonly creditBalanceService: CreditBalanceService) {}

    @Get()
    getBalance(@Param('workspaceId') workspaceId: string) {
        return this.creditBalanceService.getBalanceSummary(workspaceId);
    }
}
