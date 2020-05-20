import App from './App'
import Koa from 'koa'
import React from 'react'
import dist from 'koa-static'
import path from 'path'
import { renderToString } from 'react-dom/server'

const app = new Koa()
app.use(dist(path.join(__dirname, '../dist')))

function htmlTemplate ({ jsx }) {
  return `
    <!DOCTYPE html>
    <body>
      <div id="app">${jsx}</div>
      <script src="./app.bundle.js"></script>
    </body>
  `
}

app.use(async (ctx) => {
  const jsx = renderToString(<App />)
  ctx.body = htmlTemplate({ jsx })
})

app.listen(3000)
