import path from 'path'
import webpack, { Configuration } from 'webpack'
import LoadablePlugin from '@loadable/webpack-plugin'

const config: Configuration = {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: {
    app: [
      'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
      './src/client.tsx',
    ],
  },
  module: {
    rules: [
      {
        test: /.(jsx?|tsx?)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            [
              require.resolve('@babel/preset-env'),
              {
                modules: false,
              },
            ],
            ['react-app', { flow: false, typescript: true }],
          ],
          plugins: ['@loadable/babel-plugin'],
        },
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].bundle.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      __isBrowser__: true,
    }),
    new webpack.HotModuleReplacementPlugin(),
    new LoadablePlugin({
      writeToDisk: true,
    }),
  ],
  optimization: {
    usedExports: true,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '~': path.resolve('./src'),
    },
  },
}

export default config
