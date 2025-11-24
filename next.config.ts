import path from 'path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  webpack(config) {
    config.resolve.alias['@swc/helpers'] = path.join(process.cwd(), 'node_modules', '@swc', 'helpers')
    return config
  },
}

export default nextConfig
