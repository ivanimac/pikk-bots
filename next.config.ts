/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['hono'],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
