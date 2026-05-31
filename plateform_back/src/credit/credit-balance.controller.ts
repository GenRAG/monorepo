import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from 'generated/prisma';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreditBalanceService } from 'src/credit/credit-balance.service';
import { AddCreditRequest } from 'src/credit/dto/add-credit.request';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';
import { RolesInWorkspace } from 'src/workspace/roles/roles-workspace.decorator';

@Controller('workspaces/:workspaceId/credit-balance')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard)
export class CreditBalanceController {
    constructor(private readonly creditBalanceService: CreditBalanceService) {}

    @Get()
    getBalance(@Param('workspaceId') workspaceId: string) {
        return this.creditBalanceService.getBalance(workspaceId);
    }

    @Post()
    @RolesInWorkspace(UserRole.ADMIN)
    addCredit(@Param('workspaceId') workspaceId: string, @Body() body: AddCreditRequest) {
        return this.creditBalanceService.add({
            workspaceId,
            amount: body.amount,
        });
    }
}
