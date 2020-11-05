import React, { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { StaticRouterContext, matchPath } from 'react-router'
import { StaticRouter } from 'react-router-dom'

import App from './App'
import { getStore } from '~/redux'
import routes from './routes'

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

async function serverRender(
  path: string,
  routerContext: StaticRouterContext = {}
) {
  const preloadedState = await getInitialState(path)

  const store = getStore(preloadedState)

  const Application = () => (
    <StrictMode>
      <Provider store={store}>
        <StaticRouter location={path} context={routerContext}>
          <App />
        </StaticRouter>
      </Provider>
    </StrictMode>
  )

  return {
    store,
    Application,
    routerContext,
  }
}

export default serverRender
