/** @type {import('next').NextConfig} */
const nextConfig = {
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
