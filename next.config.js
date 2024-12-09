/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: "http",
            hostname: "localhost",
            port: "8002",
          },
          {
            protocol: "https",
            hostname: "api.letsworkwise.com",
          },
        ],
      },
}

module.exports = nextConfig
