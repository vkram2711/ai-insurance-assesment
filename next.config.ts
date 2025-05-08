import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.handlebars$/,
      loader: 'handlebars-loader',
      options: {
        precompileOptions: {
          knownHelpersOnly: false,
        },
        runtime: require.resolve('handlebars/runtime'),
      },
    });

    // Handle .js files that might contain Handlebars
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/aiconfig/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    });

    return config;
  },
};

export default nextConfig;
