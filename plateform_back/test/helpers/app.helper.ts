import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module';
import { AllExceptionsFilter } from '../../src/exeptions/interceptor.service';
import { Logger } from 'nestjs-pino';

export async function createTestApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideModule(ThrottlerModule)
        .useModule(ThrottlerModule.forRoot([{ ttl: 60000, limit: 10000 }]))
        .compile();

    const app = moduleFixture.createNestApplication({ logger: false });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalFilters(new AllExceptionsFilter(app.get(Logger)));
    app.use(cookieParser());

    await app.init();
    return app;
}
