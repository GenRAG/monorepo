import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export const STRIPE_CLIENT = 'STRIPE_CLIENT';

/** `null` without `STRIPE_SECRET_KEY` (local dev, CI): the app starts and only billing routes refuse. */
export const stripeProvider = {
    provide: STRIPE_CLIENT,
    inject: [ConfigService],
    useFactory: (config: ConfigService): Stripe | null => {
        const key = config.get<string>('STRIPE_SECRET_KEY');
        return key ? new Stripe(key) : null;
    },
};

export function requireStripe(stripe: Stripe | null): Stripe {
    if (!stripe) throw new ServiceUnavailableException("Le paiement n'est pas configuré sur ce serveur");
    return stripe;
}
