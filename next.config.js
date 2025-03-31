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
            protocol: "http",
            hostname: "10.0.147.23:3000",
          },
        ],
      },
}

module.exports = nextConfig
