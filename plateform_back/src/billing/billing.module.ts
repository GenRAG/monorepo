import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { BillingController } from './billing.controller';
import { BillingRepository } from './billing.repository';
import { BillingService } from './billing.service';
import { BillingWebhookController } from './billing-webhook.controller';
import { stripeProvider } from './stripe.provider';

@Module({
    imports: [PrismaModule, WorkspaceModule],
    controllers: [BillingController, BillingWebhookController],
    providers: [BillingService, BillingRepository, stripeProvider],
    exports: [BillingService],
})
export class BillingModule {}
