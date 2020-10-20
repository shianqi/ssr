import { Store, applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers'

let REDUX_STORE: Store | null = null

// eslint-disable-next-line @typescript-eslint/ban-types
export const getStore = (preloadedState?: {}) => {
  if (!REDUX_STORE) {
    const initialState = {}
    //  if (typeof window === 'object') {
    //    initialState = window.__PRELOADED_STATE__
    //    delete window.__PRELOADED_STATE__
    //  }
    REDUX_STORE = createStore(
      rootReducer,
      preloadedState || initialState,
      applyMiddleware(thunk)
    )
  }

  return REDUX_STORE
}
