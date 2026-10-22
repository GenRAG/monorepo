import { BadRequestException, Controller, Headers, HttpCode, Post, RawBodyRequest, Req } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import Stripe from 'stripe';
import { BillingService } from './billing.service';

/** Called by Stripe only: authenticated by the signature of the raw body, not by a session. */
@ApiExcludeController()
@Controller('billing/webhook')
export class BillingWebhookController {
    constructor(private readonly billingService: BillingService) {}

    @Post()
    @HttpCode(200)
    async handle(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string | undefined,
    ): Promise<{ received: true }> {
        if (!req.rawBody || !signature) throw new BadRequestException('Missing Stripe signature');

        let event: Stripe.Event;
        try {
            event = this.billingService.constructEvent(req.rawBody, signature);
        } catch (error) {
            if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
                throw new BadRequestException('Invalid Stripe signature');
            }
            throw error;
        }
        await this.billingService.handleEvent(event);
        return { received: true };
    }
}
