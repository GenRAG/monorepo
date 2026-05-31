import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { AgentModule } from './agent/agent.module';
import { WorkflowModule } from './workflow/workflow.module';
import { AgentRuntimeModule } from './agent-runtime/agent-runtime.module';
import { CreditModule } from 'src/credit/credit.module';
import { DocumentModule } from './document/document.module';
import { DeploymentModule } from './deployment/deployment.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { ConversationModule } from './conversation/conversation.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
        RedisModule,
        LoggerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const isProduction = configService.get('NODE_ENV') === 'production';
                const isTest = configService.get('NODE_ENV') === 'development';
                return {
                    pinoHttp: {
                        autoLogging: !isTest,
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
                              port: Number(configService.get('REDIS_PORT')),
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
        DocumentModule,
        AgentModule,
        WorkflowModule,
        AgentRuntimeModule,
        CreditModule,
        DocumentModule,
        DeploymentModule,
        OnboardingModule,
        ConversationModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
