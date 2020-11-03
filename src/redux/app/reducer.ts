import { createReducer } from 'typesafe-actions'

export interface AppState {
  mode: string
}

const initState: AppState = {
  mode: 'dark',
}

const reducer = createReducer(initState)

export default reducer
