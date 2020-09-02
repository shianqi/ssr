import express from 'express'

import HotReloader from './hot-reloader'

export default class Server {
  constructor() {
    this.app = express()
    this.hotReloader = this.getHotReloader()
  }

  getHotReloader() {
    return new HotReloader()
  }

  prepare() {
    const middlewares = this.hotReloader.getMiddlewares()
    this.app.use(middlewares)
  }

  start() {
    this.hotReloader.start()
    this.prepare()
    this.app.listen(3000)
  }
}

new Server().start()
