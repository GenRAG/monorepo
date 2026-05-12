import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module';
import { AllExceptionsFilter } from '../../src/exeptions/interceptor.service';
import { Logger } from 'nestjs-pino';

export async function createTestApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication({ logger: false });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalFilters(new AllExceptionsFilter(app.get(Logger)));
    app.use(cookieParser());

    await app.init();
    return app;
}
