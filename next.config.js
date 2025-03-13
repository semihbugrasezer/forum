/** @ts-check */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Next.js App Router redirects
  async redirects() {
    return [
      {
        source: "/\\(forum\\)",
        destination: "/forum",
        permanent: true,
      },
      {
        source: "/\\(forum\\)/:path*",
        destination: "/forum/:path*",
        permanent: true,
      },
      {
        source: "/profile",
        destination: "/user-profile",
        permanent: true,
      },
      {
        source: "/search",
        destination: "/",
        permanent: true,
      },
      {
        source: "/notifications",
        destination: "/",
        permanent: true,
      },
      {
        source: "/messages",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
