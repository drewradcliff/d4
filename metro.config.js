const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
/** @type {import("expo/metro-config").MetroConfig} */
const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push("sql");
module.exports = withNativeWind(config, { input: "./styles/global.css" });
