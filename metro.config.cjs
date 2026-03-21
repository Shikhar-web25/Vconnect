const { getDefaultConfig } = require('metro-config');

const config = getDefaultConfig(__dirname);

// Add any custom configurations here if needed
if (config.resolver) {
  config.resolver.blacklistRE = /node_modules\/.*\/android\/build\/.*/;
}

module.exports = config;
