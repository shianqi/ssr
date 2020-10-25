import webpack, { Configuration } from 'webpack'
import path from 'path'

const config: Configuration = {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: {
    server: ['./src/server.tsx'],
  },
  target: 'node',
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
    filename: '[name].bundle.server.js',
    libraryTarget: 'commonjs2',
  },
  plugins: [
    new webpack.DefinePlugin({
      __isBrowser__: false,
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '~': path.resolve('./src'),
    },
  },
}

export default config
