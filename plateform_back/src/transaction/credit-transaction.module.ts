import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CreditTransactionRepository } from 'src/transaction/credit-transaction.repository';
import { CreditTransactionService } from 'src/transaction/credit-transaction.service';

@Module({
    controllers: [],
    providers: [CreditTransactionRepository, CreditTransactionService],
    imports: [PrismaModule],
    exports: [CreditTransactionService],
})
export class CreditTransactionModule {}
