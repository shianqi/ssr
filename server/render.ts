import React from 'react'
import path from 'path'
import { Request, Response } from 'express'
import { compilation } from 'webpack'
import { renderToString } from 'react-dom/server'
import { ChunkExtractor } from '@loadable/server'
import requireFromString from 'require-from-string'
import { matchPath } from 'react-router'
import serialize from 'serialize-javascript'
import routes from '../src/routes'

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

const getInitialState = async (path: string) => {
  for (const route of routes) {
    if (route.path) {
      const routeStr =
        typeof route.path === 'string' ? route.path : route.path[0]
      if (matchPath(routeStr, path)) {
        const { getInitialState } = route
        if (getInitialState) {
          return await getInitialState()
        }
      }
    }
  }
}

export const renderMiddleware = (req: Request, res: Response) => {
  const ssrOptions = getSsrOptions(res.locals)

  getInitialState(req.path).then((state) => {
    if (ssrOptions) {
      // const { Application } = ssrOptions(req)
      // const webExtractor = new ChunkExtractor({ statsFile: webStats })
      // console.log(Application)
      // const jsx = webExtractor.collectChunks(React.createElement(Application))
      // const html = renderToString(jsx)

      const nodeExtractor = new ChunkExtractor({ statsFile: nodeStats })
      const { default: getApp } = nodeExtractor.requireEntrypoint() as any
      const { Application } = getApp(req, state)

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
          <textarea id="__REDUX_INITIAL_STATE__" style="display: none;">${serialize(
            state,
            { isJSON: true }
          )}</textarea>
          <div id="app">${html}</div>
          ${webExtractor.getScriptTags()}
        </body>
      </html>
    `)
    }
  })
}
