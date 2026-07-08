import './sentry/instrument';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from 'src/exeptions/interceptor.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.getHttpAdapter().getInstance().set('trust proxy', 1);

    const config = new DocumentBuilder().setTitle('GenRAG API').setVersion('1.0').build();
    const document = SwaggerModule.createDocument(app, config);

    const frontendUrl = app.get(ConfigService).getOrThrow<string>('FRONTEND_URL');
    app.enableCors({
        origin: frontendUrl.split(',').map((u) => u.trim()),
        credentials: true,
    });

    app.useLogger(app.get(Logger));

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
        }),
    );

    app.useGlobalFilters(new AllExceptionsFilter(app.get(Logger)));

    app.use(cookieParser());

    app.use('/docs', apiReference({ spec: { content: document } } as any));

    await app.listen(app.get(ConfigService).getOrThrow('PORT'));
}

void bootstrap();
