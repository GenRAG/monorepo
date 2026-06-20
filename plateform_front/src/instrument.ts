import * as Sentry from "@sentry/react";

Sentry.init({
    enabled: process.env.NODE_ENV === "production",
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],

    tracesSampleRate: 0.1,
    tracePropagationTargets: ["localhost", /^https:\/\/api\.genrag\.io/],

    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
});
