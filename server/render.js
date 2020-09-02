import React from 'react'
import path from 'path'
import { renderToString } from 'react-dom/server'
import requireFromString from 'require-from-string'

function htmlTemplate({ jsx, scripts }) {
  return `
    <!DOCTYPE html>
    <body>
      <div id="app">${jsx}</div>
      ${scripts.map((item) => `<script src="./${item}"></script>`).join('\n')}
    </body>
  `
}

function getJsxString(locals) {
  const { webpackStats, fs } = locals
  const [, serverStats] = webpackStats.stats
  const serverJsonWebpackStats = serverStats.toJson()
  const {
    assetsByChunkName: serverAssetsByChunkName,
    outputPath,
  } = serverJsonWebpackStats
  const { server } = serverAssetsByChunkName
  const serverPath = path.join(outputPath, server)
  const App = requireFromString(fs.readFileSync(serverPath).toString()).default

  return renderToString(<App />)
}

function getScripts(locals) {
  const { webpackStats } = locals
  const [clientStats] = webpackStats.stats
  const clientJsonWebpackStats = clientStats.toJson()
  const { assetsByChunkName } = clientJsonWebpackStats
  const { app } = assetsByChunkName

  return app
}

export const renderMiddleware = (req, res) => {
  const scripts = getScripts(res.locals)
  const jsx = getJsxString(res.locals)

  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(
    htmlTemplate({
      jsx,
      scripts: Array.isArray(scripts) ? scripts : [scripts],
    })
  )
}
