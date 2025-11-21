/**
 * Next.js configuration to fix Turbopack root inference and allow fallback.
 */
const path = require('path')

module.exports = {
  reactStrictMode: true,
  // Provide empty turbopack config to silence mixed-mode error
  turbopack: {},
  // To force legacy webpack: run `next dev --webpack`
  webpack(config) {
    config.resolve.alias['@swc/helpers'] = path.join(__dirname, 'node_modules', '@swc', 'helpers')
    return config
  }
}