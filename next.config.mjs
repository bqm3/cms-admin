import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@heroui/system", "@heroui/react"],
  webpack(config) {
    config.resolve.alias["react-router-dom"] = path.resolve(
      __dirname,
      "src/lib/nextRouterShim.tsx",
    );
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "https://api.globalpromotionllc.com/sitemap.xml",
      },
      {
        source: "/robots.txt",
        destination: "https://api.globalpromotionllc.com/robots.txt",
      },
    ];
  },
};

export default nextConfig;
