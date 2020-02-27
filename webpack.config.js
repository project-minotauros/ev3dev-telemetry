const path = require('path');

module.exports = {
  entry: './src/app.ts',
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.tsx', '.ts'],
    modules: ["node_modules"],
  },
  node: {
    fs: 'empty'
  }
};
