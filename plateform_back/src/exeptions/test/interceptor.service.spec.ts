import { ArgumentsHost, BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import { Prisma } from 'generated/prisma';

jest.mock('@sentry/nestjs', () => ({ captureException: jest.fn() }));
import * as Sentry from '@sentry/nestjs';
import { AllExceptionsFilter } from 'src/exeptions/interceptor.service';

describe('AllExceptionsFilter', () => {
    const logger = { error: jest.fn() } as unknown as Logger;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const host = {
        switchToHttp: () => ({
            getResponse: () => ({ status }),
            getRequest: () => ({ url: '/workspaces/ws-1/agents', method: 'POST' }),
        }),
    } as unknown as ArgumentsHost;

    let filter: AllExceptionsFilter;

    beforeEach(() => {
        jest.clearAllMocks();
        filter = new AllExceptionsFilter(logger);
    });

    it('should keep the HttpException response body and status', () => {
        filter.catch(new NotFoundException('Agent not found'), host);

        expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
        expect(json).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: HttpStatus.NOT_FOUND,
                path: '/workspaces/ws-1/agents',
                error: { statusCode: 404, message: 'Agent not found', error: 'Not Found' },
            }),
        );
        expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should keep class-validator messages of a BadRequestException', () => {
        filter.catch(new BadRequestException(['name must be a string']), host);

        expect(json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: { statusCode: 400, message: ['name must be a string'], error: 'Bad Request' },
            }),
        );
    });

    it('should not leak the internals of a non-HTTP exception (Prisma code, meta, version)', () => {
        const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
            code: 'P2002',
            clientVersion: '6.9.0',
            meta: { target: ['email'], modelName: 'User' },
        });

        filter.catch(prismaError, host);

        expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        const body = json.mock.calls[0][0] as Record<string, unknown>;
        expect(body.error).toEqual({ statusCode: 500, error: 'Internal Server Error' });
        expect(JSON.stringify(body)).not.toMatch(/P2002|modelName|clientVersion|email/);
        expect(Sentry.captureException).toHaveBeenCalledWith(prismaError);
    });
});
