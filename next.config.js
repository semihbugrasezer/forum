/** @ts-check */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    domains: ["localhost", "oauhlrhvaqiuusuiqfno.supabase.co"],
  },
  serverExternalPackages: ["@supabase/ssr"],
  experimental: {
    esmExternals: true,
    serverActions: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
