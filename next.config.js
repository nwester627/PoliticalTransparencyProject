/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/commons/**",
      },
      {
        protocol: "https",
        hostname: "www.supremecourt.gov",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.congress.gov",
        pathname: "/img/**",
      },
      {
        protocol: "https",
        hostname: "www.senate.gov",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.house.gov",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
