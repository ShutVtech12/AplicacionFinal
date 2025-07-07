const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    blacklistRE: exclusionList([/react-dom/]),
    // También puedes incluir otras reglas si hace falta ignorar más paquetes web-only
  },
};

module.exports = mergeConfig(defaultConfig, config);

