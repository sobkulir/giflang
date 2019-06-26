const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    main: './src/interpret.ts',
    test: './src/tests.ts'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.jison$/,
        use: 'jison-gho-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  output: {
    path: path.resolve(__dirname, 'dist')
  }
};