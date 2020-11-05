import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import { Store, RootState } from 'typesafe-actions'
import rootReducer from './reducers'

let REDUX_STORE: Store

export const enhancer = applyMiddleware(thunk)

export const getStore = (preloadedState?: Partial<RootState>) => {
  if (!REDUX_STORE) {
    let initialState: RootState | undefined

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
