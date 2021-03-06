import { Store as ReduxStore, StoreEnhancer } from 'redux'
import {
  RootState as ReduxRootState,
  RootAction as ReduxRootAction,
} from '../redux/reducers'
import { enhancer } from '../redux'

type UnStoreEnhancer<Enhancer> = Enhancer extends StoreEnhancer<infer V>
  ? V
  : never
type UnStoreEnhancerState<Enhancer> = Enhancer extends StoreEnhancer<
  unknown,
  infer V
>
  ? V
  : never
type EnhancerExt = UnStoreEnhancer<typeof enhancer>
type EnhancerExtState = UnStoreEnhancerState<typeof enhancer>

declare module 'typesafe-actions' {
  export type Store = ReduxStore<RootState & EnhancerExtState, RootAction> &
    EnhancerExt

  export type RootState = ReduxRootState
  export type RootAction = ReduxRootAction

  interface Types {
    RootAction: RootAction
  }
}

declare module 'react-redux' {
  interface DefaultRootState extends ReduxRootState {}
}
