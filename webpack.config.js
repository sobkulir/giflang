const path = require("path");
const tsNameof = require("ts-nameof");

module.exports = {
  mode: "development",
  entry: {
    main: "./src/giflang.ts",
    test: "./src/tests.ts"
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          options: { getCustomTransformers: () => ({ before: [tsNameof] }) }
        },
        exclude: /node_modules/
      },
      {
        test: /\.jison$/,
        use: "jison-gho-loader"
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".json"]
  },
  output: {
    path: path.resolve(__dirname, "dist")
  }
};
