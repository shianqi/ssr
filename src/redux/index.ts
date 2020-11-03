import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import { Store } from 'typesafe-actions'
import rootReducer from './reducers'

let REDUX_STORE: Store

export const enhancer = applyMiddleware(thunk)

// eslint-disable-next-line @typescript-eslint/ban-types
export const getStore = (preloadedState?: {}) => {
  if (!REDUX_STORE) {
    let initialState = {}

    if (typeof window === 'object') {
      const dom = document.getElementById('__REDUX_INITIAL_STATE__')
      if (dom) {
        initialState = JSON.parse(dom.innerText)
      }
    }

    REDUX_STORE = createStore(
      rootReducer,
      preloadedState || initialState,
      applyMiddleware(thunk)
    )
  }

  return REDUX_STORE
}
