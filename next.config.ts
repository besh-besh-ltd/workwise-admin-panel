import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  devIndicators: false,

  images: {
    remotePatterns: [
      // localhost backend
      {
        protocol: "http",
        hostname: "localhost",
        port: "8002",
        pathname: "/**",
      },

      // render backend
      {
        protocol: "https",
        hostname: "workwise-backend-ff68.onrender.com",
        pathname: "/**",
      },

      // test S3 bucket
      {
        protocol: "https",
        hostname: "test-workwise-bucket.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },

      // prod/static S3 bucket
      {
        protocol: "https",
        hostname: "workwise-static-s3.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },

      // API domain
      {
        protocol: "https",
        hostname: "api.letsworkwise.com",
        pathname: "/**",
      },
      // API domain over HTTP (Need to remove this after backend enforces HTTPS)
      {
        protocol: "http",
        hostname: "api.letsworkwise.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tenderhub.letsworkwise.com",
        pathname: "/**",
      },
      // API domain over HTTP (Need to remove this after backend enforces HTTPS)
      {
        protocol: "http",
        hostname: "tenderhub.letsworkwise.com",
        pathname: "/**",
      }
    ],
  },

  async rewrites() {
    return [
      { source: "/sitemap.xml", destination: "/api/sitemap.xml" },
      { source: "/sitemap-website.xml", destination: "/api/sitemap-website.xml" },
      { source: "/sitemap-vendors.xml", destination: "/api/sitemap-vendors.xml" },
    ];
  },
};

export default nextConfig;
