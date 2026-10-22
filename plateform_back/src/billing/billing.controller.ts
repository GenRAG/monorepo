import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserSafe } from 'src/users/dto/create-user.request';
import { CurrentUserPipe } from 'src/users/pipes/user-validation.pipe';
import { WorkspaceMemberGuard } from 'src/workspace/guards/workspace-member.guard';
import { BillingService } from './billing.service';
import { BillingSummary } from './dto/billing-summary.response';
import { InvoiceResponse } from './dto/invoice.response';
import { TopUpRequest } from './dto/top-up.request';

@Controller('workspaces/:workspaceId/billing')
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    @Get()
    getSummary(@Param('workspaceId') workspaceId: string): Promise<BillingSummary> {
        return this.billingService.getSummary(workspaceId);
    }

    @Get('invoices')
    listInvoices(@Param('workspaceId') workspaceId: string): Promise<InvoiceResponse[]> {
        return this.billingService.listInvoices(workspaceId);
    }

    @Post('subscription')
    @HttpCode(200)
    subscribe(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
    ): Promise<{ url: string }> {
        return this.billingService.createSubscriptionCheckout(workspaceId, user.email);
    }

    @Post('top-up')
    @HttpCode(200)
    topUp(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
        @Body() { amountEuros }: TopUpRequest,
    ): Promise<{ url: string }> {
        return this.billingService.createTopUpCheckout(workspaceId, user.email, amountEuros);
    }

    @Post('portal')
    @HttpCode(200)
    portal(@Param('workspaceId') workspaceId: string): Promise<{ url: string }> {
        return this.billingService.createPortalSession(workspaceId);
    }
}
