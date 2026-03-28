import {
    Body,
    Controller,
    Injectable,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreditBalanceService } from 'src/credit/credit-balance.service';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';

@Injectable()
@Controller('workspaces/:workspaceId/credit-balance')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard)
export class CreditBalanceController {
    constructor(private readonly creditBalanceService: CreditBalanceService) {}

    @Post()
    addCredit(
        @Param('workspaceId') workspaceId: string,
        @Body() body: { amount: number },
    ) {
        return this.creditBalanceService.add({
            workspaceId: workspaceId,
            amount: body.amount,
        });
    }
}
