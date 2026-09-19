// Runs in the browser. With @sentry/nextjs v8 + Next 14 this file must be
// named sentry.client.config.js (instrumentation-client.js is Next 15+/SDK 9+).
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 100% of transactions in this demo; lower this in real production apps.
  tracesSampleRate: 1.0,

  // Propagate trace headers to our own API routes so replays link to backend errors.
  tracePropagationTargets: ["localhost", /^\//],

  integrations: [
    Sentry.replayIntegration({
      // Privacy options (both toggles "on" in the Sentry setup screen).
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of normal sessions; raise for demos if needed.
  replaysOnErrorSampleRate: 1.0, // 100% of sessions where an error happens.

  // Helpful while wiring things up; turn off once everything works.
  debug: false,
});
