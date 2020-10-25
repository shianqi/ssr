import React, { StrictMode } from 'react'
// import { Provider } from 'react-redux'
import { StaticRouterContext } from 'react-router'
import { StaticRouter } from 'react-router-dom'

import App from './App'
// import { getStore } from '~/redux'

async function serverRender(req: any, routerContext: StaticRouterContext = {}) {
  // const preloadedState = req.state || {}
  // const store = getStore({})

  const Application = (
    <StrictMode>
      {/* <Provider store={store}> */}
      <StaticRouter location={req.path} context={routerContext}>
        <App />
      </StaticRouter>
      {/* </Provider> */}
    </StrictMode>
  )

  return {
    // store,
    Application,
    routerContext,
  }
}

export default serverRender
