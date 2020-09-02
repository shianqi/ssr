import webpack, { MultiCompiler, Compiler, Configuration } from 'webpack'
import hotMiddleware from 'webpack-hot-middleware'
import devMiddleware from 'webpack-dev-middleware'

import webpackClientConfig from '../config/webpack.config.client'
import webpackServerConfig from '../config/webpack.config.server'
import { renderMiddleware } from './render'

function deleteCache(path: string) {
  delete require.cache[path]
}

export default class HotReloader {
  prevAssets: any
  compiler: MultiCompiler
  clientCompiler: Compiler
  serverCompiler: Compiler

  constructor() {
    const compiler = webpack([
      webpackClientConfig as Configuration,
      webpackServerConfig as Configuration,
    ])
    const [clientCompiler, serverCompiler] = compiler.compilers

    this.prevAssets = null
    this.compiler = compiler
    this.clientCompiler = clientCompiler
    this.serverCompiler = serverCompiler
  }

  start() {
    this.prepareBuildTools()
  }

  prepareBuildTools() {
    this.serverCompiler.hooks.afterEmit.tap('after-emit', (compilation) => {
      const { assets } = compilation

      if (this.prevAssets) {
        for (const f of Object.keys(assets)) {
          deleteCache(assets[f].existsAt)
        }
        for (const f of Object.keys(this.prevAssets)) {
          if (!assets[f]) {
            deleteCache(this.prevAssets[f].existsAt)
          }
        }
      }
      this.prevAssets = assets
    })
  }

  getHotMiddleware() {
    return hotMiddleware(this.clientCompiler, {
      log: console.log,
      path: '/__webpack_hmr',
      heartbeat: 10 * 1000,
    })
  }

  getDevMiddleware() {
    return devMiddleware(this.compiler, {
      serverSideRender: true,
    })
  }

  getMiddlewares() {
    return [this.getHotMiddleware(), this.getDevMiddleware(), renderMiddleware]
  }
}
