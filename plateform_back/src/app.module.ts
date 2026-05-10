import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { AgentModule } from './agent/agent.module';
import { WorkflowModule } from './workflow/workflow.module';
import { AgentRuntimeModule } from './agent-runtime/agent-runtime.module';
import { CreditBalanceModule } from 'src/credit/credit-balance.module';
import { DocumentModule } from './document/document.module';
import { DeploymentModule } from './deployment/deployment.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
    imports: [
        LoggerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const isProduction =
                    configService.get('NODE_ENV') === 'production';
                const isTest = configService.get('NODE_ENV') === 'test';
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
                        level: isTest
                            ? 'silent'
                            : isProduction
                              ? 'info'
                              : 'debug',
                    },
                };
            },
            inject: [ConfigService],
        }),
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST ?? 'localhost',
                port: Number(process.env.REDIS_PORT) ?? 6379,
            },
        }),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        UsersModule,
        AuthModule,
        WorkspaceModule,
        DocumentModule,
        AgentModule,
        WorkflowModule,
        AgentRuntimeModule,
        CreditBalanceModule,
        DocumentModule,
        DeploymentModule,
        OnboardingModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
