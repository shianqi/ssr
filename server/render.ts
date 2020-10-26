import React from 'react'
import path from 'path'
import { Request, Response } from 'express'
import { compilation } from 'webpack'
import { renderToString } from 'react-dom/server'
import { ChunkExtractor } from '@loadable/server'
import requireFromString from 'require-from-string'

function getSsrOptions(locals: Record<string, any>) {
  const { webpackStats, fs } = locals
  const [, serverStats] = (webpackStats as compilation.MultiStats).stats

  const serverJsonWebpackStats = serverStats.toJson()
  const { assetsByChunkName, outputPath = '' } = serverJsonWebpackStats

  if (assetsByChunkName) {
    const { main } = assetsByChunkName
    const serverPath = path.join(
      outputPath,
      Array.isArray(main) ? main[0] : main
    )

    const row = fs.readFileSync(serverPath).toString()
    return requireFromString(row).default
  }
  return null
}

const nodeStats = path.resolve(__dirname, '../dist/loadable-stats-node.json')
const webStats = path.resolve(__dirname, '../dist/loadable-stats-web.json')

export const renderMiddleware = async (req: Request, res: Response) => {
  const ssrOptions = getSsrOptions(res.locals)

  if (ssrOptions) {
    // const { Application } = ssrOptions(req)
    // const webExtractor = new ChunkExtractor({ statsFile: webStats })
    // console.log(Application)
    // const jsx = webExtractor.collectChunks(React.createElement(Application))
    // const html = renderToString(jsx)

    const nodeExtractor = new ChunkExtractor({ statsFile: nodeStats })
    const { default: getApp } = nodeExtractor.requireEntrypoint() as any
    const { Application } = getApp(req)

    const webExtractor = new ChunkExtractor({ statsFile: webStats })
    const jsx = webExtractor.collectChunks(React.createElement(Application))

    const html = renderToString(jsx)

    res.set('content-type', 'text/html')
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
        ${webExtractor.getLinkTags()}
        ${webExtractor.getStyleTags()}
        </head>
        <body>
          <div id="app">${html}</div>
          ${webExtractor.getScriptTags()}
        </body>
      </html>
    `)
  }
}
