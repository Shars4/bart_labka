import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Self-contained server (.next/standalone) for a small Docker image.
  output: 'standalone',
  cacheComponents: true,
  partialPrefetching: true,
  // Treat every client like an HTML-only crawler: metadata is resolved
  // before the response starts, so <title>, description and Open Graph tags
  // are always in the server-rendered <head> (not streamed into <body>), and
  // a missing animal answers with a real HTTP 404.
  htmlLimitedBots: /.*/,
  poweredByHeader: false,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
