import { RouteProps } from 'react-router'
import loadable from '@loadable/component'

import withRoot, { RootConfigProps } from './containers/withRoot'

const Home = loadable(
  () => import(/* webpackChunkName: "home" */ './pages/Home')
)

export type ExtendRouteProps = RouteProps & {
  withAuth?: boolean
  rootConfig?: RootConfigProps
  getInitialState?: () => Promise<any>
}

const initRoutes: ExtendRouteProps[] = [
  {
    path: '/',
    exact: true,
    component: Home,
  },
]

const routes: ExtendRouteProps[] = initRoutes.map((item) => ({
  ...item,
  component: withRoot(item.component || Home),
  getInitialState: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ app: { mode: 'light' } })
      }, 300)
    })
  },
}))

export default routes
