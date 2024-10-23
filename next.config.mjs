/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.json$/,
      use: {
        loader: '@lingui/loader'
      }
    })
    return config
  },
  experimental: {
    swcPlugins: [['@lingui/swc-plugin', {}]]
  },
};

export default nextConfig;
