import { HttpException, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

export const GENERIC_ERROR_MESSAGE = 'Une erreur est survenue. Veuillez réessayer.';

export function toClientSafeErrorMessage(err: unknown, logPrefix: string, logger: Logger): string {
    if (err instanceof HttpException) {
        return err.message;
    }
    logger.error(`${logPrefix}: ${err instanceof Error ? err.message : String(err)}`);
    Sentry.captureException(err);
    return GENERIC_ERROR_MESSAGE;
}
