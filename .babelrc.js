module.exports = {
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
}
