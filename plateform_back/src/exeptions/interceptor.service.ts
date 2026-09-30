import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Inject } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { Logger } from 'nestjs-pino';

const INTERNAL_ERROR_BODY = { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, error: 'Internal Server Error' };

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(@Inject(Logger) private readonly logger: Logger) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        // Only HttpExceptions carry a client-facing body. Anything else (Prisma, axios, TypeError…) is
        // serialized with its enumerable fields (code, meta, clientVersion…), so it is replaced by a
        // generic body shaped like Nest's HttpException responses; the details stay in logs and Sentry.
        const message = exception instanceof HttpException ? exception.getResponse() : INTERNAL_ERROR_BODY;

        if (!(exception instanceof HttpException) || status >= 500) {
            Sentry.captureException(exception);
        }

        this.logger.error({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            line: exception instanceof Error ? exception.stack : null,
        });

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            error: message,
        });
    }
}
