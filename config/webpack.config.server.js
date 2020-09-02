const path = require('path')

module.exports = {
  mode: 'development',
  entry: {
    server: ['./src/App.tsx'],
  },
  module: {
    rules: [
      {
        test: /.(jsx?|tsx?)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].bundle.js',
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
}
