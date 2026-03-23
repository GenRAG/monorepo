import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { AgentModule } from './agent/agent.module';
import { WorkflowModule } from './workflow/workflow.module';
import { AgentRuntimeModule } from './agent-runtime/agent-runtime.module';

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
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        UsersModule,
        AuthModule,
        WorkspaceModule,
        AgentModule,
        WorkflowModule,
        AgentRuntimeModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
