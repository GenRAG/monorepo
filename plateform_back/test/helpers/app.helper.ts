import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
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
        // Routes set their own @Throttle limits (e.g. 10 logins/min), which the module-level override above
        // does not relax: the suites share one IP, so rate limiting is disabled for e2e tests.
        .overrideGuard(ThrottlerGuard)
        .useValue({ canActivate: () => true })
        .compile();

    const app = moduleFixture.createNestApplication({ logger: false });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalFilters(new AllExceptionsFilter(app.get(Logger)));
    app.use(cookieParser());

    await app.init();
    return app;
}
