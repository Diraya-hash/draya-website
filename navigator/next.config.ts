import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // This app is nested inside the Draya corporate repo; pin the trace root to
  // silence the multi-lockfile workspace-root warning.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
