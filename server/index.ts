import Koa from 'koa'

import HotReloader from './hot-reloader'

export default class Server {
  app: Koa
  hotReloader: HotReloader

  constructor() {
    this.app = new Koa()
    this.hotReloader = this.getHotReloader()
  }

  getHotReloader() {
    return new HotReloader()
  }

  async prepare() {
    const middlewares = this.hotReloader.getMiddlewares()

    this.app.use(async (ctx) => {
      ctx.res.statusCode = 200

      for (const fn of middlewares) {
        await new Promise((resolve, reject) => {
          fn(ctx.req, ctx.res, (err: Error) => {
            if (err) return reject(err)
            resolve(null)
          })
        })
      }
    })
  }

  async start() {
    this.hotReloader.start()
    await this.prepare()
    this.app.listen(3000)
  }
}

new Server().start()
