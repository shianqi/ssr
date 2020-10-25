import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { loadableReady } from '@loadable/component'

import App from './App'
import { getStore } from './redux'

const store = getStore()

const Client = (
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
)

loadableReady(() => {
  ReactDOM.hydrate(Client, document.getElementById('app'))
})
