const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required in Next 14 so instrumentation.js (Sentry server init) runs.
  experimental: { instrumentationHook: true },
};

module.exports = withSentryConfig(nextConfig, {
  // Suppresses source map uploading logs during build when no auth token is set.
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
