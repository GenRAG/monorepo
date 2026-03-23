import { Module } from '@nestjs/common';
import { CreditBalanceModule } from 'src/credit/credit-balance.module';
import { CreditTransactionService } from 'src/transaction/credit-transaction.service';
import { UsageTrackerService } from 'src/usage-tracker/usage-tracker.service';

@Module({
    controllers: [],
    providers: [UsageTrackerService, CreditTransactionService],
    imports: [CreditBalanceModule],
    exports: [UsageTrackerService],
})
export class UsageTrackerModule {}
