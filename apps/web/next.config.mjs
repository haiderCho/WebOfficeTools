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
}

export default nextConfig
