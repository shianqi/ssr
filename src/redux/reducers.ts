import { combineReducers } from 'redux'
import { StateType, ActionType } from 'typesafe-actions'
import appReducer from './app/reducer'

import * as appActions from './app/actions'

const rootReducer = combineReducers({ app: appReducer })

export type RootState = StateType<typeof rootReducer>
export type RootAction = ActionType<typeof appActions>

export default rootReducer
