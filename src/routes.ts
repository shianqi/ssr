import { RouteProps } from 'react-router'
// import { matchPath } from 'react-router-dom'
import loadable from '@loadable/component'
import withRoot, { RootConfigProps } from '~/containers/withRoot'

const Home = loadable(
  () => import(/* webpackChunkName: "home" */ '~/pages/Home')
)

export type ExtendRouteProps = RouteProps & {
  withAuth?: boolean
  rootConfig?: RootConfigProps
  // loadData?: (
  //   store: any,
  //   match: ReturnType<typeof matchPath>,
  //   path: string
  // ) => Promise<any>
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
}))

export default routes
