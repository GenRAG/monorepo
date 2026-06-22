import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { CreditBalanceController } from './credit-balance.controller';
import { CreditBalanceRepository } from './credit-balance.repository';
import { CreditBalanceService } from './credit-balance.service';
import { CreditTransactionRepository } from './credit-transaction.repository';
import { CreditTransactionService } from './credit-transaction.service';
import { UsageTrackerService } from './usage-tracker.service';

@Module({
    controllers: [CreditBalanceController],
    providers: [
        CreditBalanceRepository,
        CreditBalanceService,
        CreditTransactionRepository,
        CreditTransactionService,
        UsageTrackerService,
    ],
    imports: [PrismaModule, WorkspaceModule],
    exports: [CreditBalanceService, CreditTransactionService, UsageTrackerService],
})
export class CreditModule {}
