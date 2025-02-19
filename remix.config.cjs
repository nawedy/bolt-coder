/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  serverBuildPath: "api/index.js",
  serverModuleFormat: "cjs",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  serverPlatform: "node",
  future: {
    v3_fetcherPersist: true,
    v3_lazyRouteDiscovery: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
  },
  browserNodeBuiltinsPolyfill: {
    modules: { path: true }
  },
  watchPaths: ["app/**/*"],
  serverDependenciesToBundle: ["virtual:uno.css?__remix_sideEffect__"],
  serverMinify: true,
};
