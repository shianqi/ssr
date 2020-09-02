import express from 'express'
import webpack from 'webpack'
import React from 'react'
import path from 'path'
import devMiddleware from 'webpack-dev-middleware'
import hotMiddleware from 'webpack-hot-middleware'
import { renderToString } from 'react-dom/server'

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
    writeToDisk: true,
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
  const { webpackStats } = res.locals
  const [clientStats, serverStats] = webpackStats.stats
  const jsonWebpackStats = clientStats.toJson()
  const { assetsByChunkName } = jsonWebpackStats
  const { app } = assetsByChunkName

  const serverJsonWebpackStats = serverStats.toJson()
  const { assetsByChunkName: serverAssetsByChunkName } = serverJsonWebpackStats
  const { server } = serverAssetsByChunkName

  const serverPath = path.resolve(__dirname, `../dist/${server}`)
  const App = require(serverPath).default
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
