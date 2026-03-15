/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@opensuite/core",
    "@opensuite/plugin-api",
    "@opensuite/editor-engine",
    "@opensuite/ui",
    "@opensuite/utils",
    "@opensuite/plugin-word",
    "@opensuite/plugin-table-builder"
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "fs": false,
        "node:fs": false,
        "path": false,
        "node:path": false,
        "stream": false,
        "node:stream": false,
        "https": false,
        "node:https": false,
        "http": false,
        "node:http": false,
      };
    }
    return config;
  },
}

export default nextConfig
