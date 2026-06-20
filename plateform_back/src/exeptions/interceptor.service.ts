import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Inject } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { Logger } from 'nestjs-pino';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(@Inject(Logger) private readonly logger: Logger) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof HttpException ? exception.getResponse() : exception;

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
