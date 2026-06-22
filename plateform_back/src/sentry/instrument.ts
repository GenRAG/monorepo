import * as Sentry from '@sentry/nestjs';

Sentry.init({
    dsn: 'https://dd0bd0cf9a3bb707d6e598317bc97e82@o4511539987480576.ingest.de.sentry.io/4511542994600016',
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // To disable sending user data, uncomment the line below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#dataCollection
    // dataCollection: { userInfo: false },
});
