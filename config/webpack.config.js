const path = require('path')

module.exports = {
  mode: 'development',
  entry: {
    app: './src/client.jsx'
  },
  module: {
    rules: [
      {
        test: /.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].bundle.js'
  }
}
