import ErrorOverlayPlugin from 'error-overlay-webpack-plugin'
import path from 'path'
import webpack, { Configuration } from 'webpack'

import LoadablePlugin from '@loadable/webpack-plugin'
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin'

const isDev = process.env.NODE_ENV !== 'production'

const getConfig: (target: 'web' | 'node') => Configuration = (target) => ({
  name: target,
  mode: 'development',
  devtool: 'cheap-module-source-map',
  target,
  entry:
    target === 'web'
      ? ['webpack-hot-middleware/client', './src/client.tsx']
      : ['./src/server.tsx'],
  module: {
    rules: [
      {
        test: /.(jsx?|tsx?)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          caller: { target },
          plugins: [
            target === 'web' && require.resolve('react-refresh/babel'),
          ].filter(Boolean),
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
      ? [
          new ErrorOverlayPlugin(),
          isDev && new webpack.HotModuleReplacementPlugin(),
          isDev &&
            new ReactRefreshPlugin({
              overlay: {
                sockIntegration: 'whm',
              },
            }),
        ]
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
