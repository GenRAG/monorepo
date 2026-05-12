import { Module } from '@nestjs/common';
import { CreditBalanceController } from 'src/credit/credit-balance.controller';
import { CreditBalanceRepository } from 'src/credit/credit-balance.repository';
import { CreditBalanceService } from 'src/credit/credit-balance.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    controllers: [CreditBalanceController],
    providers: [CreditBalanceRepository, CreditBalanceService],
    imports: [PrismaModule],
    exports: [CreditBalanceService],
})
export class CreditBalanceModule {}
