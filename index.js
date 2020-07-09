require('@babel/register')({
  presets: ['@babel/preset-env'],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-runtime',
  ],
})
require('./src/server')
