import React from 'react'
// import smoothscroll from 'smoothscroll-polyfill'

interface WithRootState {
  hasError: boolean
}

export interface RootConfigProps {}

interface WithRootProps {}

const withRoot = (Component: React.ElementType) => {
  class WithRoot extends React.PureComponent<WithRootProps, WithRootState> {
    constructor(props: WithRootProps) {
      super(props)
      this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
      return {
        hasError: true,
      }
    }

    componentDidCatch(error: Error) {
      console.error(error)
    }

    render() {
      if (this.state.hasError) {
        return <div>error</div>
      }

      return <Component {...this.props} />
    }
  }

  return WithRoot
}

export default withRoot
