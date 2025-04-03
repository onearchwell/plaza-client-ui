let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: false,
    parallelServerBuildTraces: false,
    parallelServerCompiles: false,
  },
  swcMinify: false, 
  webpack(config, { isServer }) {
    // Fix externals definition
    config.externals = config.externals || [];

    // config.externals.push({
    //   "@microsoft/sp-core-library": "@microsoft/sp-core-library",
    //   "@ms/odsp-core-bundle": "@ms/odsp-core-bundle",
    //   "ControlStrings": "ControlStrings"
    // });
    config.externals.push('@ms/odsp-core-bundle', 'ControlStrings', '@microsoft/sp-core-library');

    // Add loader for .resx files
    config.module.rules.push({
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
    });

    // Disable Webpack minimization to debug Terser issues
    config.optimization.minimizer = [];

    return config;
  }
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
