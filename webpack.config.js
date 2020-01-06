const path = require("path");
const tsNameof = require("ts-nameof");

module.exports = {
  devtool: "source-map",
  entry: {
    frontend: "./frontend/app.tsx",
    test: "./interpreter/tests.ts",
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: { getCustomTransformers: () => ({ before: [tsNameof] }) }
        },
        exclude: /node_modules/
      },
      {
        test: /\.jison$/,
        use: "jison-gho-loader"
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              // This enables local scoped CSS based in CSS Modules spec
              modules: true,
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    modules: [
      path.resolve(__dirname + '/node_modules')
    ],
    alias: {
      '~': path.resolve(__dirname + '/'),
    }
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: '/assets/'
  },
  devServer: {
    contentBase: path.join(__dirname, 'frontend/public'),
    compress: true,
    port: 9000,
    hot: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    },
    historyApiFallback: {
      index: 'index.html'
    },
  }
};
