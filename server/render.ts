import React from 'react'
import path from 'path'
import { NextHandleFunction } from 'connect'
import { renderToString } from 'react-dom/server'
import { ChunkExtractor } from '@loadable/server'
import serialize from 'serialize-javascript'

import { ServerRender } from '~/typings/app'

const nodeStats = path.resolve(__dirname, '../dist/loadable-stats-node.json')
const webStats = path.resolve(__dirname, '../dist/loadable-stats-web.json')

export const renderMiddleware: NextHandleFunction = (req, res, next) => {
  const nodeExtractor = new ChunkExtractor({
    statsFile: nodeStats,
  })

  const { default: serverRender } = nodeExtractor.requireEntrypoint() as any
  ;(serverRender as ServerRender)(req.url || '/').then(
    ({ Application, store }) => {
      console.log(Application, store)
      const webExtractor = new ChunkExtractor({
        statsFile: webStats,
      })
      const jsx = webExtractor.collectChunks(React.createElement(Application))

      const html = renderToString(jsx)

      res.setHeader('content-type', 'text/html')
      res.end(`
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
      next()
    }
  )
}
