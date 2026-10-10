import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { AgentModule } from './agent/agent.module';
import { WorkflowModule } from './workflow/workflow.module';
import { AgentRuntimeModule } from './agent-runtime/agent-runtime.module';
import { AgentAnalyticsModule } from './agent-analytics/agent-analytics.module';
import { CreditModule } from 'src/credit/credit.module';
import { DocumentModule } from './document/document.module';
import { DatasetModule } from './dataset/dataset.module';
import { DeploymentModule } from './deployment/deployment.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { ConversationModule } from './conversation/conversation.module';
import { RetentionModule } from './retention/retention.module';
import { BullModule } from '@nestjs/bullmq';
import { SentryModule } from '@sentry/nestjs/setup';

@Module({
    imports: [
        SentryModule.forRoot(),
        ConfigModule.forRoot({ isGlobal: true }),
        ScheduleModule.forRoot(),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
        RedisModule,
        LoggerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const isProduction = configService.get('NODE_ENV') === 'production';
                const isTest = configService.get('NODE_ENV') === 'test';
                return {
                    pinoHttp: {
                        autoLogging: !isTest,
                        // Neither headers (JWT cookie) nor query strings (user questions on the SSE routes) are logged.
                        serializers: {
                            req: (req: { id: unknown; method: string; url: string }) => ({
                                id: req.id,
                                method: req.method,
                                url: req.url.split('?')[0],
                            }),
                            res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
                        },
                        transport: isProduction
                            ? undefined
                            : {
                                  target: 'pino-pretty',
                                  options: {
                                      singleLine: true,
                                      colorize: true,
                                      ignore: 'pid,hostname',
                                      translateTime: 'SYS:standard',
                                  },
                              },
                        level: isTest ? 'silent' : isProduction ? 'info' : 'debug',
                    },
                };
            },
            inject: [ConfigService],
        }),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const isProduction = configService.get('NODE_ENV') === 'production';
                return {
                    connection: isProduction
                        ? { url: configService.get('REDIS_URL') }
                        : {
                              host: configService.get('REDIS_HOST') ?? 'localhost',
                              // Same default as RedisModule: Number(undefined) would give NaN (ERR_SOCKET_BAD_PORT).
                              port: Number(configService.get('REDIS_PORT') ?? 6379),
                          },
                    defaultJobOptions: {
                        removeOnComplete: 50,
                        removeOnFail: 100,
                    },
                };
            },
            inject: [ConfigService],
        }),
        UsersModule,
        AuthModule,
        WorkspaceModule,
        DatasetModule,
        DocumentModule,
        AgentModule,
        WorkflowModule,
        AgentRuntimeModule,
        AgentAnalyticsModule,
        CreditModule,
        DeploymentModule,
        OnboardingModule,
        ConversationModule,
        RetentionModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
