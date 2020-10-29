import path from 'path'
import webpack, { Configuration } from 'webpack'
import LoadablePlugin from '@loadable/webpack-plugin'
import ErrorOverlayPlugin from 'error-overlay-webpack-plugin'

const getConfig: (target: 'web' | 'node') => Configuration = (target) => ({
  name: target,
  mode: 'development',
  devtool: 'cheap-module-source-map',
  target,
  entry:
    target === 'web'
      ? [
          'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
          './src/client.tsx',
        ]
      : ['./src/server.tsx'],
  module: {
    rules: [
      {
        test: /.(jsx?|tsx?)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          caller: { target },
        },
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: `[name].${target}.js`,
    libraryTarget: target === 'node' ? 'commonjs2' : undefined,
  },
  plugins: [
    new webpack.DefinePlugin({
      __isBrowser__: target === 'web',
    }),
    new LoadablePlugin({
      filename: `loadable-stats-${target}.json`,
    }),
    ...(target === 'web'
      ? [new ErrorOverlayPlugin(), new webpack.HotModuleReplacementPlugin()]
      : []),
  ],
  optimization: {
    usedExports: true,
  },
  externals:
    target === 'node'
      ? ['react', 'react-dom', '@loadable/component']
      : undefined,
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '~': path.resolve('./src'),
    },
  },
})

export default [getConfig('web'), getConfig('node')]
