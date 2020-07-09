import express from 'express'
import webpack from 'webpack'
import React from 'react'
import middleware from 'webpack-dev-middleware'
import hotMiddleware from 'webpack-hot-middleware'
import { renderToString } from 'react-dom/server'

import webpackConfig from '../config/webpack.config.client'

const app = express()
// app.use(express.static(path.resolve(__dirname, '../dist')))

const compiler = webpack(webpackConfig)

// function getFilename(serverStats, outputPath, chunkName) {
//   const assetsByChunkName = serverStats.toJson().assetsByChunkName
//   const filename = assetsByChunkName[chunkName] || ''
//   // If source maps are generated `assetsByChunkName.main`
//   // will be an array of filenames.
//   return path.join(
//     outputPath,
//     Array.isArray(filename)
//       ? filename.find((asset) => /\.js$/.test(asset))
//       : filename
//   )
// }

// function interopRequireDefault(obj) {
//   return obj && obj.__esModule ? obj.default : obj
// }

// let ServerRenderer

// compiler.hooks.done.tap('WebpackHotServerMiddleware', (stats) => {
// const outputPath = compiler.outputPath
// const outputFs = compiler.outputFileSystem
// const filename = getFilename(stats, outputPath, 'app')
// const buffer = outputFs.readFileSync(filename)
// ServerRenderer = interopRequireDefault(
//   requireFromString(buffer.toString(), filename)
// )
// })

app.use(middleware(compiler, { serverSideRender: true }))
app.use(
  hotMiddleware(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000,
  })
)
// app.use()

function htmlTemplate({ jsx, app }) {
  return `
    <!DOCTYPE html>
    <body>
      <div id="app">${jsx}</div>
      ${app.map((item) => `<script src="./${item}"></script>`).join('\n')}
    </body>
  `
}

app.use((req, res) => {
  const { webpackStats } = res.locals
  const jsonWebpackStats = webpackStats.toJson()
  const { assetsByChunkName } = jsonWebpackStats
  const { app } = assetsByChunkName

  const apath = require.resolve('./App')
  delete require.cache[apath]
  const App = require('./App').default
  const jsx = renderToString(<App />)

  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(htmlTemplate({ jsx, app: Array.isArray(app) ? app : [app] }))
})

app.listen(3000)
