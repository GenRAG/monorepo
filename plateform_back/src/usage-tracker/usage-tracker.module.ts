import { Module } from '@nestjs/common';
import { CreditBalanceModule } from 'src/credit/credit-balance.module';
import { CreditTransactionModule } from 'src/transaction/credit-transaction.module';
import { UsageTrackerService } from 'src/usage-tracker/usage-tracker.service';

@Module({
    controllers: [],
    providers: [UsageTrackerService],
    imports: [CreditBalanceModule, CreditTransactionModule],
    exports: [UsageTrackerService],
})
export class UsageTrackerModule {}
