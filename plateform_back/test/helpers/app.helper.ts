import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module';
import { AllExceptionsFilter } from '../../src/exeptions/interceptor.service';
import { Logger } from 'nestjs-pino';

/** `override` replaces providers of the real app, e.g. the Stripe client of the billing suite. */
export async function createTestApp(
    override: (builder: TestingModuleBuilder) => TestingModuleBuilder = (builder) => builder,
): Promise<INestApplication> {
    const builder = Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideModule(ThrottlerModule)
        .useModule(ThrottlerModule.forRoot([{ ttl: 60000, limit: 10000 }]))
        // Routes set their own @Throttle limits (e.g. 10 logins/min), which the module-level override above
        // does not relax: the suites share one IP, so rate limiting is disabled for e2e tests.
        .overrideGuard(ThrottlerGuard)
        .useValue({ canActivate: () => true });
    const moduleFixture = await override(builder).compile();

    const app = moduleFixture.createNestApplication({ logger: false, rawBody: true });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalFilters(new AllExceptionsFilter(app.get(Logger)));
    app.use(cookieParser());

    await app.init();
    return app;
}
