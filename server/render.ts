import { createElement } from 'react'
import path from 'path'
import { Request, Response } from 'express'
import { compilation } from 'webpack'
import { renderToString } from 'react-dom/server'
import requireFromString from 'require-from-string'

function htmlTemplate(options: { jsx: string; scripts: string[] }) {
  const { jsx, scripts } = options

  return `
    <!DOCTYPE html>
    <body>
      <div id="app">${jsx}</div>
      ${scripts.map((item) => `<script src="./${item}"></script>`).join('\n')}
    </body>
  `
}

function getJsxString(locals: Record<string, any>) {
  const { webpackStats, fs } = locals
  const [, serverStats] = (webpackStats as compilation.MultiStats).stats
  const serverJsonWebpackStats = serverStats.toJson()
  const { assetsByChunkName, outputPath = '' } = serverJsonWebpackStats

  if (assetsByChunkName) {
    const { server } = assetsByChunkName
    const serverPath = path.join(
      outputPath,
      Array.isArray(server) ? server[0] : server
    )

    const row = fs.readFileSync(serverPath).toString()
    const App = requireFromString(row).default

    return renderToString(createElement(App))
  }
  return ''
}

function getScripts(locals: Record<string, any>) {
  const { webpackStats } = locals
  const [clientStats] = (webpackStats as compilation.MultiStats).stats
  const clientJsonWebpackStats = clientStats.toJson()
  const { assetsByChunkName } = clientJsonWebpackStats

  if (assetsByChunkName) {
    const { app } = assetsByChunkName
    return app
  }

  return []
}

export const renderMiddleware = (_req: Request, res: Response) => {
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
