import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from 'src/exeptions/interceptor.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useLogger(app.get(Logger));
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
        }),
    );
    app.useGlobalFilters(new AllExceptionsFilter(app.get(Logger)));
    app.use(cookieParser());
    await app.listen(app.get(ConfigService).getOrThrow('PORT'));
}
void bootstrap();
