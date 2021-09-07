var nodeExternals = require("webpack-node-externals");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  target: "node", // in order to ignore built-in modules like path, fs, etc.
  externals: [nodeExternals({})], // ignore modules from being bundled. Ignore intel-hex, cause no typedef yet.
  devtool: "source-map",
  entry: {
    app: "./src/view/app.tsx",
    main: "./src/main.ts",
  },
  output: {
    path: __dirname + "/js",
    filename: "[name]-bundle.js",
    sourceMapFilename: "[name]-bundle.js.map",
  },
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js"],
    plugins: [new TsconfigPathsPlugin()],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
      {
        test: /\.node$/,
        loader: "native-ext-loader",
      },
    ],
  },
};
