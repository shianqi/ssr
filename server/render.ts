import React from 'react'
import path from 'path'
import { Request, Response } from 'express'
// import { compilation } from 'webpack'
import { renderToString } from 'react-dom/server'
import { ChunkExtractor } from '@loadable/server'
// import requireFromString from 'require-from-string'
import serialize from 'serialize-javascript'

import { ServerRender } from '~/typings/app'

// function getSsrOptions(locals: Record<string, any>) {
//   const { webpackStats, fs } = locals
//   const [, serverStats] = (webpackStats as compilation.MultiStats).stats

//   const serverJsonWebpackStats = serverStats.toJson()
//   const { assetsByChunkName, outputPath = '' } = serverJsonWebpackStats

//   if (assetsByChunkName) {
//     const { main } = assetsByChunkName
//     const serverPath = path.join(
//       outputPath,
//       Array.isArray(main) ? main[0] : main
//     )

//     const row = fs.readFileSync(serverPath).toString()
//     return requireFromString(row).default
//   }
//   return null
// }

const nodeStats = path.resolve(__dirname, '../dist/loadable-stats-node.json')
const webStats = path.resolve(__dirname, '../dist/loadable-stats-web.json')

export const renderMiddleware = (req: Request, res: Response) => {
  // const ssrOptions = getSsrOptions(res.locals)

  // if (ssrOptions) {
  // const { Application } = ssrOptions(req)
  // const webExtractor = new ChunkExtractor({ statsFile: webStats })
  // console.log(Application)
  // const jsx = webExtractor.collectChunks(React.createElement(Application))
  // const html = renderToString(jsx)

  const nodeExtractor = new ChunkExtractor({
    statsFile: nodeStats,
    inputFileSystem: res.locals.fs,
  })
  const { default: serverRender } = nodeExtractor.requireEntrypoint() as any
  ;(serverRender as ServerRender)(req.path).then(({ Application, store }) => {
    const webExtractor = new ChunkExtractor({
      statsFile: webStats,
      inputFileSystem: res.locals.fs,
    })
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
            store.getState(),
            { isJSON: true }
          )}</textarea>
          <div id="app">${html}</div>
          ${webExtractor.getScriptTags()}
        </body>
      </html>
    `)
  })
}
