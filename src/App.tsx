import React from 'react'
import { Route, Switch } from 'react-router-dom'

import routes from './routes'

const App = () => {
  return (
    <Switch>
      {routes.map((route, index) => (
        <Route
          key={index}
          exact={route.exact}
          path={route.path}
          component={route.component}
        />
      ))}
    </Switch>
  )
}

export default App
