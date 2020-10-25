import path from 'path'
import { Request, Response } from 'express'
import { compilation } from 'webpack'
import { renderToString } from 'react-dom/server'
import { ChunkExtractor } from '@loadable/server'
import requireFromString from 'require-from-string'

function htmlTemplate(options: {
  html: string
  scriptTags: string
  // styleTags: string
  linkTags: string
}) {
  const { html, scriptTags, linkTags } = options

  return `
    <!DOCTYPE html>
    <html>
      <head>
        ${linkTags}
      </head>
      <body>
        <div id="app">${html}</div>
        ${scriptTags}
      </body>
    </html>
  `
}

function getSsrOptions(locals: Record<string, any>) {
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
    return requireFromString(row).default
  }
  return null
}

export const renderMiddleware = async (req: Request, res: Response) => {
  // const scripts = getScripts(res.locals)
  const ssrOptions = getSsrOptions(res.locals)

  if (ssrOptions) {
    const { Application } = await ssrOptions(req)
    const statsFile = path.resolve(__dirname, '../dist/loadable-stats.json')

    const extractor = new ChunkExtractor({ statsFile, entrypoints: ['app'] })
    const jsx = extractor.collectChunks(Application)
    const html = renderToString(jsx)

    const scriptTags = extractor.getScriptTags()
    const linkTags = extractor.getLinkTags()
    // const styleTags = extractor.getStyleTags()

    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(
      htmlTemplate({
        html,
        scriptTags,
        linkTags,
        // styleTags,
      })
    )
  }

  res.end('error')
}
