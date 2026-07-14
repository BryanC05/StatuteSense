/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      const defaultIgnored = config.watchOptions?.ignored;
      if (Array.isArray(defaultIgnored)) {
        config.watchOptions.ignored = [
          ...defaultIgnored,
          "**/System Volume Information/**",
        ];
      } else if (defaultIgnored instanceof RegExp) {
        config.watchOptions.ignored = new RegExp(
          `${defaultIgnored.source}|System Volume Information`
        );
      } else if (typeof defaultIgnored === "string") {
        config.watchOptions.ignored = [
          defaultIgnored,
          "**/System Volume Information/**",
        ];
      } else {
        config.watchOptions.ignored = /node_modules|System Volume Information/;
      }
    }
    return config;
  },
};

module.exports = nextConfig;
