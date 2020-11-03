import { createAction } from 'typesafe-actions'
import { AppState } from './reducer'

export const setAppMode = createAction('SET_APP_MODE')<AppState>()
