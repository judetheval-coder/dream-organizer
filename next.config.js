/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production'
const usesLocalSd = (process.env.SD_SERVER_URL || '').includes('localhost')

// Keep proxy config only for development when a local SD server is in use.
// Vercel production builds should NOT attempt to proxy requests to localhost.
const nextConfig = {
    // ...existing config...
    experimental: isDev && usesLocalSd ? {
        proxy: {
            '/sd': {
                target: process.env.SD_SERVER_URL || 'http://localhost:3001',
                changeOrigin: true,
            },
        },
    } : {},
}

module.exports = nextConfig;
