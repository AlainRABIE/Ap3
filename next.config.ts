import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

const nextConfig: NextConfig = {
  webpackDevMiddleware: (config: Configuration) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  // Vous pouvez ajouter d'autres configurations ici
};

export default nextConfig;
