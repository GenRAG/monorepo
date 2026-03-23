import { Module } from '@nestjs/common';
import { CreditBalanceRepository } from 'src/credit/credit-balance.repository';
import { CreditBalanceService } from 'src/credit/credit-balance.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    controllers: [],
    providers: [CreditBalanceRepository, CreditBalanceService],
    imports: [PrismaModule],
    exports: [CreditBalanceService],
})
export class CreditBalanceModule {}
