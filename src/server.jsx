import express from 'express'
import webpack from 'webpack'
import React from 'react'
import path from 'path'
import devMiddleware from 'webpack-dev-middleware'
import hotMiddleware from 'webpack-hot-middleware'
import { renderToString } from 'react-dom/server'
import requireFromString from 'require-from-string'

import webpackClientConfig from '../config/webpack.config.client'
import webpackServerConfig from '../config/webpack.config.server'

const app = express()
const compiler = webpack([webpackClientConfig, webpackServerConfig])

function deleteCache(path) {
  delete require.cache[path]
}

const [clientCompiler, serverCompiler] = compiler.compilers

let prevAssets = null

serverCompiler.hooks.afterEmit.tap('after-emit', (compilation) => {
  const { assets } = compilation

  if (prevAssets) {
    for (const f of Object.keys(assets)) {
      deleteCache(assets[f].existsAt)
    }
    for (const f of Object.keys(prevAssets)) {
      if (!assets[f]) {
        deleteCache(prevAssets[f].existsAt)
      }
    }
  }
  prevAssets = assets
})

app.use(
  devMiddleware(compiler, {
    serverSideRender: true,
  })
)
app.use(
  hotMiddleware(clientCompiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000,
  })
)

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
  const { webpackStats, fs } = res.locals
  const [clientStats, serverStats] = webpackStats.stats
  const clientJsonWebpackStats = clientStats.toJson()
  const { assetsByChunkName } = clientJsonWebpackStats
  const { app } = assetsByChunkName

  const serverJsonWebpackStats = serverStats.toJson()
  const {
    assetsByChunkName: serverAssetsByChunkName,
    outputPath,
  } = serverJsonWebpackStats
  const { server } = serverAssetsByChunkName

  const serverPath = path.join(outputPath, server)
  const App = requireFromString(fs.readFileSync(serverPath).toString()).default
  const jsx = renderToString(<App />)

  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(
    htmlTemplate({
      jsx,
      app: Array.isArray(app) ? app : [app],
    })
  )
})

app.listen(3000)
